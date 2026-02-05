<script lang="ts">
    import type { Metric } from "$lib/types";
    import { parseRange, groupMetricsByTestName } from "$lib/utils";
    import type { ReferenceRangeMap } from "$lib/types";
    import { TrendingUp, TrendingDown, Minus } from "lucide-svelte";

    let {
        allMetrics,
        dbRanges,
    }: { allMetrics: Metric[]; dbRanges?: ReferenceRangeMap } = $props();

    // Group metrics by test name
    let groupedByTest = $derived(groupMetricsByTestName(allMetrics));

    // Get list of numeric tests only (for the dropdown)
    let availableTests = $derived(
        Object.keys(groupedByTest).filter((name) => {
            const metrics = groupedByTest[name];
            return metrics.some((m) => typeof m.test_value === "number");
        }),
    );

    // Selected test
    let selectedTestName = $state("");

    // Initialize selectedTestName when availableTests changes
    $effect(() => {
        if (availableTests.length > 0 && !selectedTestName) {
            selectedTestName = availableTests[0];
        }
    });

    // Data for selected test (sorted by date, oldest first)
    let currentData = $derived(
        selectedTestName && groupedByTest[selectedTestName]
            ? groupedByTest[selectedTestName]
                  .filter((m) => typeof m.test_value === "number")
                  .sort(
                      (a, b) =>
                          new Date(a.test_date).getTime() -
                          new Date(b.test_date).getTime(),
                  )
            : [],
    );

    // Available dates for baseline selection (all except the latest)
    let availableBaselines = $derived(
        currentData.length > 1 ? currentData.slice(0, -1) : [],
    );

    // Selected baseline index (default to first/oldest date)
    let baselineIndex = $state(0);

    // Reset baseline when test changes
    $effect(() => {
        if (selectedTestName) {
            baselineIndex = 0;
        }
    });

    // Helper: Calculate distance from optimal range (0 if inside)
    function getDistanceToRange(value: number, min: number, max: number) {
        if (value < min) return min - value;
        if (value > max) return value - max;
        return 0; // Inside range
    }

    // Calculate percentage change with quality assessment
    let percentageChange = $derived.by(() => {
        if (currentData.length < 2 || baselineIndex >= currentData.length - 1) {
            return null;
        }
        const baselineValue = currentData[baselineIndex].test_value as number;
        const latestValue = currentData[currentData.length - 1]
            .test_value as number;

        if (baselineValue === 0) return null;

        const change = ((latestValue - baselineValue) / baselineValue) * 100;

        // Determine quality (Good vs Bad) based on reference range
        let quality: "good" | "bad" | "neutral" = "neutral";

        if (refRange) {
            const distBaseline = getDistanceToRange(
                baselineValue,
                refRange.min,
                refRange.max,
            );
            const distLatest = getDistanceToRange(
                latestValue,
                refRange.min,
                refRange.max,
            );

            // If we moved closer to the range (distance decreased), that's good!
            // If we moved further away (distance increased), that's bad.
            if (distLatest < distBaseline) {
                quality = "good";
            } else if (distLatest > distBaseline) {
                quality = "bad";
            } else {
                // Distance didn't change (e.g. both inside range, or moved parallel to range?)
                // If both are inside range (dist=0), it's generally neutral/good.
                // Let's call it neutral unless we want to incentivize "optimal".
                quality = "neutral";
            }
        }

        return {
            value: change,
            baselineDate: currentData[baselineIndex].test_date,
            latestDate: currentData[currentData.length - 1].test_date,
            baselineValue,
            latestValue,
            quality,
        };
    });

    // Reference range for selected test (with fallback to default ranges)
    let refRange = $derived.by(() => {
        if (currentData.length > 0) {
            // Pass test name for fallback lookup if ref_range is empty
            return parseRange(
                currentData[0].ref_range,
                selectedTestName,
                dbRanges,
            );
        }
        return null;
    });

    // Unit
    let unit = $derived(currentData[0]?.unit || "");

    // Chart dimensions
    const WIDTH = 600;
    const HEIGHT = 280;
    const PADDING = { top: 30, right: 30, bottom: 40, left: 50 };
    const chartWidth = WIDTH - PADDING.left - PADDING.right;
    const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;

    // Scales
    let yDomain = $derived.by(() => {
        if (currentData.length === 0) return { min: 0, max: 100 };
        const values = currentData.map((d) => d.test_value as number);
        let min = Math.min(...values);
        let max = Math.max(...values);
        if (refRange) {
            min = Math.min(min, refRange.min);
            max = Math.max(max, refRange.max);
        }
        const padding = (max - min) * 0.15 || 10;
        return { min: min - padding, max: max + padding };
    });

    function yScale(value: number) {
        return (
            PADDING.top +
            chartHeight -
            ((value - yDomain.min) / (yDomain.max - yDomain.min)) * chartHeight
        );
    }

    function xScale(index: number, total: number) {
        if (total <= 1) return PADDING.left + chartWidth / 2;
        return PADDING.left + (index / (total - 1)) * chartWidth;
    }

    let linePath = $derived.by(() => {
        if (currentData.length < 2) return "";
        const points = currentData.map((d, i) => ({
            x: xScale(i, currentData.length),
            y: yScale(d.test_value as number),
        }));

        let path = `M ${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpX = (prev.x + curr.x) / 2;
            path += ` C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
        }
        return path;
    });

    // Hover state
    let hoveredIndex: number | null = $state(null);

    // Format date
    function formatDate(d: Date | string) {
        const date = new Date(d);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "2-digit",
        });
    }

    function formatShortDate(d: Date | string) {
        const date = new Date(d);
        return date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
        });
    }

    // Y-axis tick values (dynamic step based on range)
    let yTickValues = $derived.by(() => {
        const range = yDomain.max - yDomain.min;
        // Choose step to get roughly 5-8 ticks
        let step: number;
        if (range <= 50) step = 10;
        else if (range <= 100) step = 20;
        else if (range <= 200) step = 25;
        else if (range <= 500) step = 50;
        else if (range <= 1000) step = 100;
        else if (range <= 2000) step = 200;
        else step = 500;

        const startTick = Math.ceil(yDomain.min / step) * step;
        const endTick = Math.floor(yDomain.max / step) * step;
        const ticks: number[] = [];
        for (let v = startTick; v <= endTick; v += step) {
            ticks.push(v);
        }
        return ticks;
    });
</script>

<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
    <!-- Header with Selector -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-lg font-semibold text-slate-800">
                Biomarker Trends
            </h2>
            <p class="text-sm text-slate-500">
                Select a biomarker to view its history
            </p>
        </div>
        <div class="flex items-center gap-3">
            <!-- Percentage Change Indicator -->
            {#if percentageChange !== null}
                {@const quality = percentageChange.quality}
                <div
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                    class:bg-green-50={quality === "good"}
                    class:text-green-700={quality === "good"}
                    class:bg-red-50={quality === "bad"}
                    class:text-red-700={quality === "bad"}
                    class:bg-slate-100={quality === "neutral"}
                    class:text-slate-600={quality === "neutral"}
                >
                    {#if percentageChange.value > 0}
                        <TrendingUp class="w-4 h-4" />
                        <span>+{percentageChange.value.toFixed(1)}%</span>
                    {:else if percentageChange.value < 0}
                        <TrendingDown class="w-4 h-4" />
                        <span>{percentageChange.value.toFixed(1)}%</span>
                    {:else}
                        <Minus class="w-4 h-4" />
                        <span>No change</span>
                    {/if}
                </div>
            {/if}

            <select
                bind:value={selectedTestName}
                class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
                {#each availableTests as testName}
                    <option value={testName}>{testName}</option>
                {/each}
            </select>
        </div>
    </div>

    <!-- Baseline Selector (only show if more than 2 dates) -->
    {#if availableBaselines.length > 1}
        <div class="flex items-center gap-2 mb-4 text-sm text-slate-600">
            <span>Compare to:</span>
            <select
                bind:value={baselineIndex}
                class="px-2 py-1 border border-slate-200 rounded text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
                {#each availableBaselines as baseline, i}
                    <option value={i}
                        >{formatShortDate(baseline.test_date)}</option
                    >
                {/each}
            </select>
            <span class="text-slate-400">→</span>
            <span class="font-medium text-slate-700">
                {formatShortDate(
                    currentData[currentData.length - 1]?.test_date || "",
                )}
            </span>
        </div>
    {/if}

    <!-- Chart -->
    {#if currentData.length > 0}
        <svg viewBox="0 0 {WIDTH} {HEIGHT}" class="w-full max-h-[400px]">
            <!-- Reference Range Band -->
            {#if refRange}
                <rect
                    x={PADDING.left}
                    y={yScale(refRange.max)}
                    width={chartWidth}
                    height={yScale(refRange.min) - yScale(refRange.max)}
                    fill="rgba(34, 197, 94, 0.15)"
                    stroke="rgba(34, 197, 94, 0.3)"
                    stroke-width="1"
                    stroke-dasharray="4 2"
                />
                <!-- Range Labels -->
                <text
                    x={PADDING.left - 8}
                    y={yScale(refRange.max) + 4}
                    text-anchor="end"
                    fill="#22c55e"
                    font-size="11"
                    font-weight="500"
                >
                    {refRange.max}
                </text>
                <text
                    x={PADDING.left - 8}
                    y={yScale(refRange.min) + 4}
                    text-anchor="end"
                    fill="#22c55e"
                    font-size="11"
                    font-weight="500"
                >
                    {refRange.min}
                </text>
            {/if}

            <!-- Grid Lines with Y-Axis Tick Labels (multiples of 10) -->
            {#each yTickValues as tickValue}
                {@const yPos = yScale(tickValue)}
                {@const isRefBoundary =
                    refRange &&
                    (Math.abs(tickValue - refRange.min) < 2 ||
                        Math.abs(tickValue - refRange.max) < 2)}
                <line
                    x1={PADDING.left}
                    y1={yPos}
                    x2={PADDING.left + chartWidth}
                    y2={yPos}
                    stroke="#f1f5f9"
                    stroke-width="1"
                />
                <!-- Y-axis tick label (skip if too close to ref range bounds) -->
                {#if !isRefBoundary}
                    <text
                        x={PADDING.left - 8}
                        y={yPos + 3}
                        text-anchor="end"
                        fill="#b0b8c4"
                        font-size="6"
                    >
                        {tickValue}
                    </text>
                {/if}
            {/each}

            <!-- Value Line -->
            <path
                d={linePath}
                fill="none"
                stroke="#3b82f6"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <!-- Data Points -->
            {#each currentData as dataPoint, i}
                {@const isBaseline = i === baselineIndex}
                {@const isLatest = i === currentData.length - 1}
                <circle
                    cx={xScale(i, currentData.length)}
                    cy={yScale(dataPoint.test_value as number)}
                    r={hoveredIndex === i || isBaseline || isLatest ? 6 : 4}
                    fill={hoveredIndex === i
                        ? "#2563eb"
                        : isBaseline
                          ? "#f59e0b"
                          : isLatest
                            ? "#10b981"
                            : "#3b82f6"}
                    stroke="white"
                    stroke-width="2"
                    class="cursor-pointer transition-all duration-150"
                    role="button"
                    tabindex="0"
                    onmouseenter={() => (hoveredIndex = i)}
                    onmouseleave={() => (hoveredIndex = null)}
                />
            {/each}

            <!-- X-Axis Labels -->
            {#each currentData as dataPoint, i}
                <text
                    x={xScale(i, currentData.length)}
                    y={HEIGHT - 15}
                    text-anchor="middle"
                    fill="#94a3b8"
                    font-size="11"
                >
                    {formatDate(dataPoint.test_date)}
                </text>
            {/each}

            <!-- Y-Axis Label -->
            <text
                x={15}
                y={HEIGHT / 2}
                text-anchor="middle"
                fill="#64748b"
                font-size="12"
                transform="rotate(-90, 15, {HEIGHT / 2})"
            >
                {unit || "Value"}
            </text>

            <!-- Tooltip -->
            {#if hoveredIndex !== null}
                {@const hoveredData = currentData[hoveredIndex]}
                {@const x = xScale(hoveredIndex, currentData.length)}
                {@const y = yScale(hoveredData.test_value as number)}
                <g>
                    <rect
                        x={x - 50}
                        y={y - 50}
                        width="100"
                        height="40"
                        rx="6"
                        fill="white"
                        stroke="#e2e8f0"
                        stroke-width="1"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                    />
                    <text
                        {x}
                        y={y - 35}
                        text-anchor="middle"
                        fill="#1e293b"
                        font-size="12"
                        font-weight="600"
                    >
                        {hoveredData.test_value}
                        {unit}
                    </text>
                    <text
                        {x}
                        y={y - 20}
                        text-anchor="middle"
                        fill="#64748b"
                        font-size="10"
                    >
                        {formatDate(hoveredData.test_date)}
                    </text>
                </g>
            {/if}
        </svg>
    {:else}
        <div class="h-64 flex items-center justify-center text-slate-400">
            <p>No historical data available for this biomarker.</p>
        </div>
    {/if}
</div>

<script lang="ts">
    import type { Metric } from "$lib/types";
    import { parseRange, groupMetricsByTestName } from "$lib/utils";

    let { allMetrics }: { allMetrics: Metric[] } = $props();

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

    // Data for selected test
    let currentData = $derived(
        selectedTestName && groupedByTest[selectedTestName]
            ? groupedByTest[selectedTestName].filter(
                  (m) => typeof m.test_value === "number",
              )
            : [],
    );

    // Reference range for selected test
    let refRange = $derived.by(() => {
        if (currentData.length > 0) {
            return parseRange(currentData[0].ref_range);
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
        <select
            bind:value={selectedTestName}
            class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
            {#each availableTests as testName}
                <option value={testName}>{testName}</option>
            {/each}
        </select>
    </div>

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
                <circle
                    cx={xScale(i, currentData.length)}
                    cy={yScale(dataPoint.test_value as number)}
                    r={hoveredIndex === i ? 6 : 4}
                    fill={hoveredIndex === i ? "#2563eb" : "#3b82f6"}
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

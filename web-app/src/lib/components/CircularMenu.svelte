<script lang="ts">
    import { fade, scale, fly } from "svelte/transition";

    import { elasticOut, cubicOut } from "svelte/easing";
    import TrendChart from "./TrendChart.svelte";
    import StringBiomarkers from "./StringBiomarkers.svelte";
    import CompactMetricRow from "./CompactMetricRow.svelte";
    import type { Metric } from "$lib/types";
    import { X } from "lucide-svelte";
    import { isMetricAbnormal, groupMetricsByDate } from "$lib/utils";
    let { groupedMetrics }: { groupedMetrics: Record<string, Metric[]> } =
        $props();

    let categories = $derived(Object.keys(groupedMetrics));
    let selectedCategory: string | null = $state(null);

    let metricsByDate = $derived(
        selectedCategory
            ? groupMetricsByDate(groupedMetrics[selectedCategory])
            : {},
    );

    let sortedDateKeys = $derived(
        Object.keys(metricsByDate).sort(
            (a, b) => new Date(b).getTime() - new Date(a).getTime(),
        ),
    );

    // Configuration
    const RADIUS = 220; // px (Spaced out more)

    function getPosition(index: number, total: number) {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start at top
        return {
            x: Math.cos(angle) * RADIUS,
            y: Math.sin(angle) * RADIUS,
        };
    }

    function select(cat: string) {
        selectedCategory = cat;
    }

    function close() {
        selectedCategory = null;
    }
</script>

<div class="relative w-full h-[720px] flex items-center justify-center">
    <!-- Center Label / Instructions (Only visible when no selection) -->
    {#if !selectedCategory}
        <div
            class="absolute z-0 text-center pointer-events-none"
            in:fade={{ duration: 400 }}
            out:fade={{ duration: 200 }}
        >
            <h3
                class="text-xl font-bold text-slate-400 tracking-widest uppercase"
            >
                Health
            </h3>
            <p class="text-xs text-slate-300 tracking-wider uppercase mt-1">
                Tracker
            </p>
        </div>
    {/if}

    <!-- Circular Menu -->
    {#if !selectedCategory}
        <div
            class="absolute inset-0 flex items-center justify-center animate-spin-slow"
            transition:fade={{ duration: 300 }}
        >
            {#each categories as cat, i}
                {@const pos = getPosition(i, categories.length)}
                {@const metrics = groupedMetrics[cat]}
                {@const abnormalCount = metrics.filter((m) =>
                    isMetricAbnormal(m),
                ).length}
                {@const total = metrics.length}
                {@const healthRatio = (total - abnormalCount) / total}

                <!-- Color Logic: Gradient Interpolation -->
                {@const getRingColor = (ratio: number) => {
                    if (ratio === 1) return "#22c55e"; // Green-500
                    if (ratio === 0) return "#dc2626"; // Red-600

                    if (ratio >= 0.5) {
                        // Interpolate Orange -> Green
                        const t = (ratio - 0.5) * 2;
                        const r = Math.round(249 + (34 - 249) * t);
                        const g = Math.round(115 + (197 - 115) * t);
                        const b = Math.round(22 + (94 - 22) * t);
                        return `rgb(${r}, ${g}, ${b})`;
                    } else {
                        // Interpolate Red -> Orange
                        const t = ratio * 2;
                        const r = Math.round(220 + (249 - 220) * t);
                        const g = Math.round(38 + (115 - 38) * t);
                        const b = Math.round(38 + (22 - 38) * t);
                        return `rgb(${r}, ${g}, ${b})`;
                    }
                }}
                {@const ringColor = getRingColor(healthRatio)}

                <!-- SVG Circle Configuration -->
                {@const size = 140}
                {@const strokeWidth = 5}
                {@const radius = (size - strokeWidth) / 2}
                {@const circumference = 2 * Math.PI * radius}
                {@const strokeDasharray = `${circumference * healthRatio} ${circumference}`}

                <!-- Gap Logic: Start at Top (-90) but offset by Gap. -->
                {@const gapAngle = (1 - healthRatio) * 360}
                {@const rotation = -90 + gapAngle}

                <div
                    class="absolute flex items-center justify-center z-10"
                    style="transform: translate({pos.x}px, {pos.y}px);"
                    in:scale={{
                        duration: 400,
                        delay: i * 50,
                        easing: elasticOut,
                    }}
                >
                    <!-- Progress Ring -->
                    <svg
                        class="absolute pointer-events-none"
                        width={size}
                        height={size}
                        style="transform: rotate({rotation}deg);"
                    >
                        <!-- Background Track -->
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="#e2e8f0"
                            stroke-width={strokeWidth}
                            opacity="0.8"
                        />
                        <!-- Value Arc (Quality) -->
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={ringColor}
                            stroke-width={strokeWidth}
                            stroke-dasharray={strokeDasharray}
                            stroke-linecap="round"
                        />
                    </svg>

                    <button
                        class="w-28 h-28 rounded-full flex flex-col items-center justify-center p-2 hover:scale-110 transition-all duration-300 group cursor-pointer relative"
                        style="animation: counter-spin 270s linear infinite;"
                        onclick={() => select(cat)}
                    >
                        <span
                            class="text-[10px] font-bold text-slate-600 text-center uppercase leading-tight group-hover:text-indigo-600"
                        >
                            {cat}
                        </span>
                        <span
                            class="mt-1 text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"
                        >
                            {abnormalCount > 0
                                ? `${abnormalCount} Issues`
                                : "All Good"}
                        </span>
                    </button>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Detail View (Modal/Overlay) -->
    {#if selectedCategory}
        <div
            class="absolute bg-white rounded-xl shadow-2xl border border-slate-100 flex flex-col z-20 overflow-hidden"
            style="inset: 5%; width: 90%; height: 90%;"
            in:scale={{ duration: 300, start: 0.9, easing: cubicOut }}
            out:scale={{ duration: 200, start: 0.95, opacity: 0 }}
        >
            <!-- Header -->
            <div
                class="bg-indigo-600 px-4 py-3 flex items-center justify-between text-white shadow-md flex-shrink-0"
            >
                <div>
                    <h3 class="text-lg font-bold tracking-wide">
                        {selectedCategory}
                    </h3>
                    <p class="text-xs text-indigo-100 opacity-80">
                        {groupedMetrics[selectedCategory].length} Tests
                    </p>
                </div>
                <button
                    onclick={close}
                    class="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X class="w-5 h-5" />
                </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-4 bg-slate-50">
                <TrendChart allMetrics={groupedMetrics[selectedCategory]} />
                <StringBiomarkers metrics={groupedMetrics[selectedCategory]} />
            </div>
        </div>
    {/if}
</div>

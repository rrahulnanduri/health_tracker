<script lang="ts">
    import type { Metric, ReferenceRangeMap } from "$lib/types";
    import { isMetricAbnormal, normalizeMetricName } from "$lib/utils";

    let {
        metrics,
        dbRanges,
    }: { metrics: Metric[]; dbRanges?: ReferenceRangeMap } = $props();

    // Filter to only string values
    let stringMetrics = $derived(
        metrics.filter((m) => typeof m.test_value !== "number"),
    );

    // Group by test name and get the latest value
    let latestByName = $derived.by(() => {
        const map = new Map<string, Metric>();
        for (const m of stringMetrics) {
            // Normalize name key to handle case sensitivity
            const nameKey = normalizeMetricName(m.test_name);
            const existing = map.get(nameKey);
            if (
                !existing ||
                (m.recorded_at &&
                    existing.recorded_at &&
                    new Date(m.recorded_at) > new Date(existing.recorded_at)) ||
                (!m.recorded_at &&
                    new Date(m.test_date) > new Date(existing.test_date))
            ) {
                map.set(nameKey, m);
            }
        }
        return Array.from(map.values());
    });
</script>

{#if latestByName.length > 0}
    <div class="mt-6">
        <h3
            class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3"
        >
            Qualitative Results
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {#each latestByName as metric}
                {@const isAbnormal = isMetricAbnormal(metric, dbRanges)}
                <div
                    class="rounded-lg p-3 border transition-all duration-200 hover:shadow-md"
                    class:bg-emerald-50={!isAbnormal}
                    class:border-emerald-200={!isAbnormal}
                    class:bg-red-50={isAbnormal}
                    class:border-red-200={isAbnormal}
                >
                    <div class="flex items-start justify-between gap-2">
                        <h4
                            class="text-xs font-medium text-slate-700 leading-tight truncate"
                            title={metric.test_name}
                        >
                            {metric.test_name}
                        </h4>
                        <span
                            class="flex-shrink-0 w-2 h-2 rounded-full mt-0.5"
                            class:bg-emerald-500={!isAbnormal}
                            class:bg-red-500={isAbnormal}
                        ></span>
                    </div>
                    <p
                        class="text-sm font-semibold mt-1 truncate"
                        class:text-emerald-700={!isAbnormal}
                        class:text-red-700={isAbnormal}
                        title={String(metric.test_value)}
                    >
                        {metric.test_value}
                    </p>
                </div>
            {/each}
        </div>
    </div>
{/if}

<script lang="ts">
    import { SvelteSet } from "svelte/reactivity";
    import type { Metric } from "$lib/types";
    import { isMetricAbnormal } from "$lib/utils";
    import { getReferenceRangeWithUnit } from "$lib/referenceRanges";

    let { groupedMetrics }: { groupedMetrics: Record<string, Metric[]> } =
        $props();

    // Fixed number of date columns to display
    const NUM_DATE_COLUMNS = 3;

    // Get all unique dates across all metrics, sorted oldest to newest (so newest is rightmost)
    let allDates = $derived.by(() => {
        const dateSet = new SvelteSet<string>();
        for (const category of Object.keys(groupedMetrics)) {
            for (const metric of groupedMetrics[category]) {
                const d = new Date(metric.test_date);
                const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
                dateSet.add(dateKey);
            }
        }
        // Sort oldest first so newest appears on the right
        const sorted = Array.from(dateSet).sort((a, b) => a.localeCompare(b));
        // Take only the most recent N dates
        return sorted.slice(-NUM_DATE_COLUMNS);
    });

    // Format date for display (e.g., "Dec 2025")
    function formatDateHeader(dateStr: string): string {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        });
    }

    // Get reference range, falling back to database lookup if metric has none
    function getRefRange(metric: Metric | undefined, testName: string): string {
        if (metric?.ref_range) {
            return metric.ref_range;
        }
        // Fallback to reference range database
        const dbRange = getReferenceRangeWithUnit(testName);
        return dbRange || "-";
    }

    // Build pivot structure: category -> testName -> { date: metric }
    let pivotData = $derived.by(() => {
        const result: Record<
            string,
            Record<string, Record<string, Metric>>
        > = {};

        for (const [category, metrics] of Object.entries(groupedMetrics)) {
            result[category] = {};

            for (const metric of metrics) {
                const testName = metric.test_name;
                const dateKey = new Date(metric.test_date)
                    .toISOString()
                    .split("T")[0];

                if (!result[category][testName]) {
                    result[category][testName] = {};
                }

                // If duplicate, keep the one with latest recorded_at
                const existing = result[category][testName][dateKey];
                if (
                    !existing ||
                    (metric.recorded_at &&
                        existing.recorded_at &&
                        new Date(metric.recorded_at) >
                            new Date(existing.recorded_at))
                ) {
                    result[category][testName][dateKey] = metric;
                }
            }
        }

        return result;
    });

    // Get sorted category names
    let categories = $derived(Object.keys(groupedMetrics).sort());
</script>

<div class="table-view-container">
    {#each categories as category (category)}
        {@const testNames = Object.keys(pivotData[category]).sort()}

        <div class="category-section">
            <div class="category-header">
                {category}
            </div>

            <div class="table-wrapper">
                <table class="data-table">
                    <colgroup>
                        <col class="col-test-width" />
                        <col class="col-range-width" />
                        {#each allDates as _ (allDates.indexOf(_))}
                            <col class="col-value-width" />
                        {/each}
                    </colgroup>
                    <thead>
                        <tr>
                            <th class="col-test">Test Description</th>
                            <th class="col-range">Reference Range</th>
                            {#each allDates as date (date)}
                                <th class="col-value"
                                    >{formatDateHeader(date)}</th
                                >
                            {/each}
                        </tr>
                    </thead>
                    <tbody>
                        {#each testNames as testName (testName)}
                            {@const dateMetrics = pivotData[category][testName]}
                            {@const firstMetric = Object.values(dateMetrics)[0]}
                            {@const refRange = getRefRange(
                                firstMetric,
                                testName,
                            )}

                            <tr>
                                <td class="col-test">{testName}</td>
                                <td class="col-range">{refRange}</td>
                                {#each allDates as date (date)}
                                    {@const metric = dateMetrics[date]}
                                    {#if metric}
                                        {@const isAbnormal =
                                            isMetricAbnormal(metric)}
                                        <td
                                            class="col-value"
                                            class:cell-abnormal={isAbnormal}
                                        >
                                            <span class="value"
                                                >{metric.test_value}</span
                                            >
                                            {#if metric.unit}
                                                <span class="unit"
                                                    >{metric.unit}</span
                                                >
                                            {/if}
                                        </td>
                                    {:else}
                                        <td class="col-value cell-empty">-</td>
                                    {/if}
                                {/each}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/each}
</div>

<style>
    .table-view-container {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        padding: 1rem;
        background: #f8fafc;
    }

    .category-section {
        margin-bottom: 1.5rem;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .category-header {
        background: #475569;
        color: white;
        padding: 0.5rem 1rem;
        font-weight: 600;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .table-wrapper {
        overflow-x: auto;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8125rem;
        table-layout: fixed;
    }

    /* Fixed column widths via colgroup */
    .col-test-width {
        width: 35%;
    }

    .col-range-width {
        width: 20%;
    }

    .col-value-width {
        width: 15%;
    }

    .data-table th,
    .data-table td {
        padding: 0.5rem 0.75rem;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
        border-right: 1px solid #e2e8f0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .data-table th:last-child,
    .data-table td:last-child {
        border-right: none;
    }

    .data-table thead th {
        background: #f1f5f9;
        font-weight: 600;
        color: #475569;
        position: sticky;
        top: 0;
        z-index: 1;
    }

    .col-test {
        font-weight: 500;
    }

    .col-range {
        color: #64748b;
        font-size: 0.75rem;
    }

    .col-value {
        text-align: center;
        font-weight: 500;
    }

    .col-value .value {
        color: #1e293b;
    }

    .col-value .unit {
        color: #94a3b8;
        font-size: 0.6875rem;
        margin-left: 0.25rem;
    }

    .cell-abnormal {
        background: #fee2e2 !important;
        color: #b91c1c;
    }

    .cell-abnormal .value {
        color: #b91c1c;
        font-weight: 600;
    }

    .cell-empty {
        color: #cbd5e1;
        text-align: center;
    }

    .data-table tbody tr:hover {
        background: #f8fafc;
    }

    .data-table tbody tr:last-child td {
        border-bottom: none;
    }
</style>

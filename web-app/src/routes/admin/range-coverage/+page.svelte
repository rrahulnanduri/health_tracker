<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-slate-900 text-white p-8">
    <div class="max-w-6xl mx-auto">
        <header class="mb-8">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Reference Range Coverage
            </h1>
            <p class="text-slate-400 mt-2">
                {data.covered.length} of {data.totalMetrics} biomarkers have a DB-backed reference range.
                {data.totalDbRanges} entries in reference_ranges.
            </p>
            <a href="/admin/users" class="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block">
                ← Back to user management
            </a>
        </header>

        <!-- Missing: most urgent -->
        <section class="mb-12">
            <h2 class="text-xl font-semibold mb-4 text-red-400 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-red-400"></span>
                No reference range ({data.missing.length})
            </h2>
            <p class="text-sm text-slate-400 mb-4">
                These biomarkers have no parseable range from either the DB or the lab report's inline ref_range.
                Users see no green zone and no abnormal detection. Add an entry to <code class="text-xs bg-slate-800 px-1 py-0.5 rounded">reference_ranges</code>.
            </p>
            {#if data.missing.length === 0}
                <div class="bg-slate-800/50 rounded-lg p-6 text-center text-slate-500 border border-slate-700 border-dashed">
                    Nothing missing. All ingested biomarkers resolve to a range.
                </div>
            {:else}
                <table class="w-full bg-slate-800 rounded-lg overflow-hidden">
                    <thead class="bg-slate-700 text-left text-xs uppercase tracking-wide">
                        <tr>
                            <th class="p-3 font-medium">Test name</th>
                            <th class="p-3 font-medium">Category</th>
                            <th class="p-3 font-medium">Inline ref_range</th>
                            <th class="p-3 font-medium text-right">Records</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700">
                        {#each data.missing as m (m.test_name)}
                            <tr class="hover:bg-slate-700/50">
                                <td class="p-3 font-medium">{m.test_name}</td>
                                <td class="p-3 text-slate-400">{m.category}</td>
                                <td class="p-3 text-slate-500 font-mono text-xs">{m.sample_ref_range ?? '—'}</td>
                                <td class="p-3 text-right text-slate-400">{m.occurrence_count}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </section>

        <!-- Fragile: works via inline only -->
        <section class="mb-12">
            <h2 class="text-xl font-semibold mb-4 text-amber-400 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                Working via inline ref_range only ({data.fragile.length})
            </h2>
            <p class="text-sm text-slate-400 mb-4">
                These biomarkers work because the lab report's ref_range parses successfully — but the DB has no entry.
                If a future lab report formats the range differently, the green zone will silently break. Add a DB entry to harden.
            </p>
            {#if data.fragile.length === 0}
                <div class="bg-slate-800/50 rounded-lg p-6 text-center text-slate-500 border border-slate-700 border-dashed">
                    None.
                </div>
            {:else}
                <table class="w-full bg-slate-800 rounded-lg overflow-hidden">
                    <thead class="bg-slate-700 text-left text-xs uppercase tracking-wide">
                        <tr>
                            <th class="p-3 font-medium">Test name</th>
                            <th class="p-3 font-medium">Category</th>
                            <th class="p-3 font-medium">Inline ref_range</th>
                            <th class="p-3 font-medium text-right">Records</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700">
                        {#each data.fragile as m (m.test_name)}
                            <tr class="hover:bg-slate-700/50">
                                <td class="p-3 font-medium">{m.test_name}</td>
                                <td class="p-3 text-slate-400">{m.category}</td>
                                <td class="p-3 text-slate-500 font-mono text-xs">{m.sample_ref_range ?? '—'}</td>
                                <td class="p-3 text-right text-slate-400">{m.occurrence_count}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </section>

        <!-- Covered: collapsed summary -->
        <section>
            <h2 class="text-xl font-semibold mb-4 text-emerald-400 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                Covered ({data.covered.length})
            </h2>
            <details class="bg-slate-800 rounded-lg p-4">
                <summary class="cursor-pointer text-sm text-slate-400 hover:text-white">
                    Show all covered biomarkers
                </summary>
                <table class="w-full mt-4">
                    <thead class="text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th class="p-2 font-medium">Test name</th>
                            <th class="p-2 font-medium">Category</th>
                            <th class="p-2 font-medium text-right">Records</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700">
                        {#each data.covered as m (m.test_name)}
                            <tr>
                                <td class="p-2">{m.test_name}</td>
                                <td class="p-2 text-slate-400">{m.category}</td>
                                <td class="p-2 text-right text-slate-400">{m.occurrence_count}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </details>
        </section>
    </div>
</div>

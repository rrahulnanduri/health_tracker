<script lang="ts">
	import CircularMenu from "$lib/components/CircularMenu.svelte";
	import { groupMetricsByCategory } from "$lib/utils";
	import type { Metric } from "$lib/types";

	let { data } = $props();

	let groupedMetrics = $derived.by(() => {
		if (data.metrics) {
			return groupMetricsByCategory(data.metrics);
		}
		return {};
	});
</script>

<div
	class="h-screen w-screen overflow-hidden bg-white flex items-center justify-center"
>
	{#if data.error}
		<div class="rounded-md bg-red-50 p-4 border border-red-200">
			<h3 class="text-sm font-medium text-red-800">System Error</h3>
			<p class="text-sm text-red-700 mt-1">{data.error}</p>
		</div>
	{:else if data.metrics.length === 0}
		<div class="text-center">
			<p class="text-gray-500">No lab metrics found.</p>
		</div>
	{:else}
		<CircularMenu {groupedMetrics} />
	{/if}
</div>

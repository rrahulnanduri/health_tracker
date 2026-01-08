<script lang="ts">
	import type { Metric } from "$lib/types";
	import { isMetricAbnormal, parseRange } from "$lib/utils";
	import RangeIndicator from "./RangeIndicator.svelte";

	let { metric }: { metric: Metric } = $props();

	// Use shared heuristic
	let isPotentiallyAbnormal = $derived(isMetricAbnormal(metric));

	let parsedRange = $derived(
		typeof metric.test_value === "number"
			? parseRange(metric.ref_range)
			: null,
	);

	// Helper to check if value matches common "header" keywords like "HAEMATOLOGY"
	// to avoid redundancy if n8n duplicated data, but based on user dump, data looks clean enough row-wise.
</script>

<div
	class="flex flex-row items-center justify-between py-1.5 px-3 bg-white hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-b-0"
>
	<!-- Left: Name & Ref -->
	<div class="flex-1 min-w-0 pr-2">
		<h4
			class="text-xs sm:text-sm font-medium text-gray-900 leading-tight truncate"
			title={metric.test_name}
		>
			{metric.test_name}
		</h4>
		{#if metric.ref_range}
			<p class="text-[10px] text-gray-400 leading-tight truncate">
				{metric.ref_range}
			</p>
		{/if}
	</div>

	<!-- Right: Value & Status -->
	<div class="flex items-center space-x-2 flex-shrink-0">
		<div class="text-right flex flex-col items-end">
			<p
				class="text-xs sm:text-sm font-semibold text-gray-900 leading-tight"
			>
				{metric.test_value}
				{#if metric.unit}
					<span class="text-[10px] text-gray-500 font-normal ml-0.5"
						>{metric.unit}</span
					>
				{/if}
			</p>
			{#if parsedRange && typeof metric.test_value === "number"}
				<div class="mt-1 w-24">
					<RangeIndicator
						value={metric.test_value}
						min={parsedRange.min}
						max={parsedRange.max}
					/>
				</div>
			{/if}
		</div>

		<!-- Status Indicator (Dot) - Only if no range visualization -->
		{#if !parsedRange || typeof metric.test_value !== "number"}
			<span
				class={`block h-2 w-2 rounded-full ring-1 ring-white flex-shrink-0 ${
					isPotentiallyAbnormal ? "bg-red-500" : "bg-emerald-500"
				}`}
			></span>
		{/if}
	</div>
</div>

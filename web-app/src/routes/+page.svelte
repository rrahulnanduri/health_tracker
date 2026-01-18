<script lang="ts">
	import CircularMenu from "$lib/components/CircularMenu.svelte";
	import UserMenu from "$lib/components/UserMenu.svelte";
	import { groupMetricsByCategory } from "$lib/utils";
	import type { Metric } from "$lib/types";

	let { data } = $props();

	let groupedMetrics = $derived.by(() => {
		if (data.metrics && data.metrics.length > 0) {
			return groupMetricsByCategory(data.metrics);
		}
		return {};
	});
</script>

<!-- User Menu in top right corner -->
<UserMenu />

<div
	class="h-screen w-screen overflow-hidden bg-white flex items-center justify-center"
>
	{#if data.error}
		<div class="rounded-md bg-red-50 p-4 border border-red-200 max-w-md">
			<h3 class="text-sm font-medium text-red-800">System Error</h3>
			<p class="text-sm text-red-700 mt-1">{data.error}</p>
		</div>
	{:else if data.pendingSetup}
		<div
			class="rounded-md bg-amber-50 p-6 border border-amber-200 max-w-md text-center"
		>
			<h3 class="text-lg font-medium text-amber-800">
				Account Setup Required
			</h3>
			<p class="text-sm text-amber-700 mt-2">{data.message}</p>
			<p class="text-xs text-amber-600 mt-4">
				Your Clerk account needs to be linked to your patient record.
			</p>
		</div>
	{:else if data.pendingVerification}
		<div
			class="rounded-md bg-blue-50 p-6 border border-blue-200 max-w-md text-center"
		>
			<h3 class="text-lg font-medium text-blue-800">
				Verification Pending
			</h3>
			<p class="text-sm text-blue-700 mt-2">{data.message}</p>
			<p class="text-xs text-blue-600 mt-4">
				Please wait for an administrator to verify your account.
			</p>
		</div>
	{:else if data.metrics.length === 0}
		<div class="text-center">
			<p class="text-gray-500">No lab metrics found.</p>
		</div>
	{:else}
		<!-- Show superuser badge if applicable -->
		{#if data.isSuperuser}
			<div
				class="fixed top-4 left-4 z-50 bg-purple-600 text-white text-xs px-3 py-1 rounded-full"
			>
				Superuser Mode
			</div>
		{/if}
		<CircularMenu {groupedMetrics} />
	{/if}
</div>

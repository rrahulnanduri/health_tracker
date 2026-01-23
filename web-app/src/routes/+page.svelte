<script lang="ts">
	import CircularMenu from "$lib/components/CircularMenu.svelte";
	import TableView from "$lib/components/TableView.svelte";
	import TrendChart from "$lib/components/TrendChart.svelte";
	import UserMenu from "$lib/components/UserMenu.svelte";
	import { groupMetricsByCategory } from "$lib/utils";
	import type { Metric } from "$lib/types";
	import { LayoutGrid, Table, X } from "lucide-svelte";
	import { scale } from "svelte/transition";
	import { cubicOut } from "svelte/easing";

	let { data } = $props();

	// View mode: "circular" (default) or "table"
	let viewMode: "circular" | "table" = $state("circular");

	// Selected test for graph modal (from table view click)
	let selectedTest: {
		name: string;
		category: string;
		metrics: Metric[];
	} | null = $state(null);

	let groupedMetrics = $derived.by(() => {
		if (data.metrics && data.metrics.length > 0) {
			return groupMetricsByCategory(data.metrics);
		}
		return {};
	});

	// Handle test click from table view
	function handleTestClick(
		testName: string,
		category: string,
		metrics: Metric[],
	) {
		selectedTest = { name: testName, category, metrics };
	}

	function closeTestModal() {
		selectedTest = null;
	}
</script>

<!-- User Menu in top right corner -->
<UserMenu />

<!-- View Toggle -->
{#if data.metrics && data.metrics.length > 0 && !data.error && !data.pendingSetup && !data.pendingVerification}
	<div class="fixed top-4 left-1/2 -translate-x-1/2 z-50">
		<div
			class="flex bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-slate-200"
		>
			<button
				onclick={() => (viewMode = "circular")}
				class="px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5"
				class:bg-indigo-600={viewMode === "circular"}
				class:text-white={viewMode === "circular"}
				class:text-slate-600={viewMode !== "circular"}
				class:hover:bg-slate-100={viewMode !== "circular"}
			>
				<LayoutGrid class="w-4 h-4" />
				Categorical
			</button>
			<button
				onclick={() => (viewMode = "table")}
				class="px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5"
				class:bg-indigo-600={viewMode === "table"}
				class:text-white={viewMode === "table"}
				class:text-slate-600={viewMode !== "table"}
				class:hover:bg-slate-100={viewMode !== "table"}
			>
				<Table class="w-4 h-4" />
				Table
			</button>
		</div>
	</div>
{/if}

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
	{:else if !data.metrics || data.metrics.length === 0}
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

		<!-- Conditional view based on toggle -->
		{#if viewMode === "circular"}
			<CircularMenu {groupedMetrics} />
		{:else}
			<TableView {groupedMetrics} onTestClick={handleTestClick} />
		{/if}
	{/if}
</div>

<!-- Test Graph Modal (appears when clicking a test in table view) -->
{#if selectedTest}
	<!-- Backdrop -->
	<button
		class="fixed inset-0 bg-black/40 z-[60] cursor-default"
		onclick={closeTestModal}
		onkeydown={(e) => e.key === "Escape" && closeTestModal()}
	></button>

	<!-- Modal -->
	<div
		class="fixed inset-[5%] bg-white rounded-xl shadow-2xl border border-slate-100 flex flex-col z-[70] overflow-hidden"
		transition:scale={{ duration: 300, start: 0.9, easing: cubicOut }}
	>
		<!-- Header -->
		<div
			class="bg-indigo-600 px-4 py-3 flex items-center justify-between text-white shadow-md flex-shrink-0"
		>
			<div>
				<h3 class="text-lg font-bold tracking-wide">
					{selectedTest.name}
				</h3>
				<p class="text-xs text-indigo-100 opacity-80">
					{selectedTest.category} • {selectedTest.metrics.length} data
					points
				</p>
			</div>
			<button
				onclick={closeTestModal}
				class="p-1 hover:bg-white/20 rounded-full transition-colors"
			>
				<X class="w-5 h-5" />
			</button>
		</div>

		<!-- Content: TrendChart -->
		<div class="flex-1 overflow-y-auto p-4 bg-slate-50">
			<TrendChart allMetrics={selectedTest.metrics} />
		</div>
	</div>
{/if}

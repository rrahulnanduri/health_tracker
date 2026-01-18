<script lang="ts">
	import "../app.css";
	import { PUBLIC_CLERK_PUBLISHABLE_KEY } from "$env/static/public";
	import { initializeClerkClient } from "clerk-sveltekit/client";
	import { onMount } from "svelte";

	let { children } = $props();
	let isLoaded = $state(false);

	onMount(async () => {
		await initializeClerkClient(PUBLIC_CLERK_PUBLISHABLE_KEY);
		isLoaded = true;
	});
</script>

<svelte:head>
	<title>Health Tracker</title>
</svelte:head>

{#if isLoaded}
	{@render children()}
{:else}
	<div class="min-h-screen bg-slate-900 flex items-center justify-center">
		<div class="text-white text-lg">Loading...</div>
	</div>
{/if}

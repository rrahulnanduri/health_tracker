<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8">
	<div class="max-w-md w-full text-center">
		<div class="text-6xl font-bold text-slate-600 mb-4">
			{$page.status}
		</div>
		<h1 class="text-2xl font-semibold mb-2">
			{#if $page.status === 404}
				Page not found
			{:else if $page.status === 403}
				Access denied
			{:else if $page.status === 401}
				Sign in required
			{:else}
				Something went wrong
			{/if}
		</h1>
		<p class="text-slate-400 mb-8">
			{$page.error?.message ?? 'An unexpected error occurred.'}
		</p>
		<a
			href="/"
			class="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
		>
			Go home
		</a>
	</div>
</div>

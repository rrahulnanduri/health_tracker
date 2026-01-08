<script>
	import "../app.css";
	let { children } = $props();
</script>

<div class="min-h-screen">
	<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		{@render children()}
	</main>
</div>

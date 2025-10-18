<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	// Redirect to blocks page
	onMount(() => {
		goto('/blocks', { replaceState: true });
	});
</script>

<div class="min-h-screen flex items-center justify-center">
	<div class="text-center">
		<h1 class="text-2xl font-bold text-primary mb-4">Blockchain Explorer</h1>
		<p class="text-secondary">Loading...</p>
	</div>
</div>

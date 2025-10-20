<script lang="ts">
	export let hoverable: boolean = false;
</script>

<div 
	class="card"
	class:hoverable
>
	<slot />
</div>

<style>
	.card {
		@apply rounded-xl border shadow-lg overflow-hidden relative;
		background-color: var(--bg-secondary);
		border-color: var(--border-color);
	}

	.hoverable {
		@apply transition-shadow cursor-pointer;
	}

	.hoverable:hover {
		@apply shadow-xl border-sky-500;
	}
</style>

<script lang="ts">
	export let hoverable: boolean = false;
</script>

<div 
	class="rounded-xl border shadow-lg overflow-hidden bg-secondary border-custom"
	class:hoverable
>
	<slot />
</div>

<style>
	.bg-secondary {
		background-color: var(--bg-secondary);
	}

	.border-custom {
		border-color: var(--border-color);
	}

	.hoverable {
		@apply transition-shadow cursor-pointer;
	}

	.hoverable:hover {
		@apply shadow-xl border-sky-500;
	}
</style>

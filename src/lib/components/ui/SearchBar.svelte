<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let placeholder = 'Search...';
	export let value = '';
	export let loading = false;

	const dispatch = createEventDispatcher<{ search: string; clear: void }>();

	let debounceTimer: ReturnType<typeof setTimeout>;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			dispatch('search', value);
		}, 300);
	}

	function handleClear() {
		value = '';
		dispatch('clear');
		dispatch('search', '');
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		clearTimeout(debounceTimer);
		dispatch('search', value);
	}
</script>

<form on:submit={handleSubmit} class="search-bar">
	<div class="search-input-wrapper">
		<svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			/>
		</svg>
		<input
			type="text"
			{placeholder}
			{value}
			on:input={handleInput}
			class="search-input"
			disabled={loading}
		/>
		{#if loading}
			<div class="spinner-wrapper">
				<svg class="spinner" viewBox="0 0 24 24">
					<circle
						class="spinner-circle"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					></circle>
				</svg>
			</div>
		{:else if value}
			<button type="button" on:click={handleClear} class="clear-button" title="Clear search">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>
</form>

<style>
	.search-bar {
		@apply w-full;
	}

	.search-input-wrapper {
		@apply relative flex items-center;
	}

	.search-icon {
		@apply absolute left-3 w-5 h-5 pointer-events-none;
		color: var(--text-muted);
	}

	.search-input {
		@apply w-full pl-10 pr-10 py-2 rounded-lg border transition-all;
		background-color: var(--bg-secondary);
		border-color: var(--border-color);
		color: var(--text-primary);
	}

	.search-input:focus {
		@apply outline-none ring-2;
		border-color: var(--primary-color);
		ring-color: var(--primary-color);
	}

	.search-input:disabled {
		@apply opacity-50 cursor-not-allowed;
	}

	.search-input::placeholder {
		color: var(--text-muted);
	}

	.clear-button,
	.spinner-wrapper {
		@apply absolute right-3 w-5 h-5 flex items-center justify-center;
	}

	.clear-button {
		@apply rounded transition-colors cursor-pointer;
		color: var(--text-muted);
	}

	.clear-button:hover {
		background-color: var(--bg-tertiary);
	}

	.clear-button:hover {
		color: var(--text-primary);
	}

	.spinner {
		@apply animate-spin;
		color: var(--primary-color);
	}

	.spinner-circle {
		opacity: 0.25;
		fill: none;
	}

	.spinner-circle {
		stroke-dasharray: 80;
		stroke-dashoffset: 60;
		animation: spinner-dash 1.5s ease-in-out infinite;
	}

	@keyframes spinner-dash {
		0% {
			stroke-dasharray: 1, 200;
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dasharray: 100, 200;
			stroke-dashoffset: -15;
		}
		100% {
			stroke-dasharray: 100, 200;
			stroke-dashoffset: -125;
		}
	}
</style>

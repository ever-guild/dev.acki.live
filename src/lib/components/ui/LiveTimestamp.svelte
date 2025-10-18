<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { formatTimeAgo, getUpdateInterval } from '$lib/utils/time';

	export let timestamp: number; // Unix timestamp in seconds
	export let className: string = '';

	let displayTime = '';
	let updateTimer: ReturnType<typeof setInterval> | null = null;

	function updateDisplay() {
		displayTime = formatTimeAgo(timestamp);
		
		// Clear existing timer
		if (updateTimer) {
			clearInterval(updateTimer);
		}

		// Set new timer based on how old the timestamp is
		const interval = getUpdateInterval(timestamp);
		updateTimer = setInterval(() => {
			displayTime = formatTimeAgo(timestamp);
		}, interval);
	}

	onMount(() => {
		updateDisplay();
	});

	onDestroy(() => {
		if (updateTimer) {
			clearInterval(updateTimer);
		}
	});

	// Re-initialize when timestamp changes
	$: if (timestamp) {
		updateDisplay();
	}
</script>

<span class={className}>{displayTime}</span>

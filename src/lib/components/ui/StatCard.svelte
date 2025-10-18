<script lang="ts">
	export let label: string;
	export let value: string | number;
</script>

<div class="stat-card">
	<div class="text-xs uppercase tracking-wider mb-2 text-muted">{label}</div>
	<div class="text-2xl font-bold text-primary">{value}</div>
</div>

<style>
	.stat-card {
		@apply rounded-lg p-4 border;
		background-color: var(--bg-tertiary);
		border-color: var(--border-color);
	}

	.text-muted {
		color: var(--text-muted);
	}

	.text-primary {
		color: var(--text-primary);
	}
</style>

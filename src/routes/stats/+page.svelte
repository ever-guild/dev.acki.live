<script lang="ts">
	import { onMount } from 'svelte';
	import { getStats, type NetworkStats } from '$lib/services/blockchain';
	import { translate } from '$lib/stores/i18n';
	import Card from '$lib/components/ui/Card.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	let stats: NetworkStats | null = null;
	let loading = true;
	let error: string | null = null;
	$: t = $translate;

	onMount(async () => {
		try {
			stats = await getStats();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load statistics';
		} finally {
			loading = false;
		}
	});
</script>

<div class="page-container">
	<h1 class="page-title">{t('stats.title')}</h1>

	{#if loading}
		<SkeletonLoader>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				{#each Array(8) as _, i}
					<div class="skeleton skeleton-rect h-24"></div>
				{/each}
			</div>
			<div class="skeleton skeleton-rect h-64"></div>
		</SkeletonLoader>
	{:else if error}
		<div class="text-center py-16">
			<div class="text-red-500 mb-4">
				<svg
					class="w-16 h-16 mx-auto"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
			</div>
			<h3 class="text-lg font-semibold mb-2">Failed to load statistics</h3>
			<p class="text-muted mb-4">{error}</p>
			<button
				class="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
				on:click={() => window.location.reload()}
			>
				Retry
			</button>
		</div>
	{:else if stats}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<StatCard label={t('stats.totalBlocks')} value={stats.totalBlocks.toLocaleString()} />
			<StatCard label={t('stats.totalTransactions')} value={stats.totalTransactions.toLocaleString()} />
			<div class="relative">
				<StatCard label={t('stats.hashrate')} value={stats.hashrate} />
				<div class="absolute top-2 right-2">
					<Badge variant="warning">Mock</Badge>
				</div>
			</div>
			<div class="relative">
				<StatCard label={t('stats.activeAddresses')} value={stats.activeAddresses.toLocaleString()} />
				<div class="absolute top-2 right-2">
					<Badge variant="warning">Mock</Badge>
				</div>
			</div>
			<StatCard label={t('stats.avgBlockTime')} value={stats.avgBlockTime} />
			<div class="relative">
				<StatCard label={t('stats.difficulty')} value={stats.difficulty} />
				<div class="absolute top-2 right-2">
					<Badge variant="warning">Mock</Badge>
				</div>
			</div>
			<div class="relative">
				<StatCard label={t('stats.marketCap')} value={stats.marketCap} />
				<div class="absolute top-2 right-2">
					<Badge variant="warning">Mock</Badge>
				</div>
			</div>
			<div class="relative">
				<StatCard label={t('stats.price')} value={stats.price} />
				<div class="absolute top-2 right-2">
					<Badge variant="warning">Mock</Badge>
				</div>
			</div>
		</div>

		<Card>
			<div class="p-6">
				<h2 class="text-2xl font-bold text-primary mb-4">Network Overview</h2>
				<div class="space-y-4">
					<div class="flex justify-between items-center py-3 border-b border-custom">
						<span class="text-secondary font-medium">{t('stats.totalBlocks')}</span>
						<span class="text-primary font-bold text-lg">{stats.totalBlocks.toLocaleString()}</span>
					</div>
					<div class="flex justify-between items-center py-3 border-b border-custom">
						<span class="text-secondary font-medium">{t('stats.totalTransactions')}</span>
						<span class="text-primary font-bold text-lg">{stats.totalTransactions.toLocaleString()}</span>
					</div>
					<div class="flex justify-between items-center py-3 border-b border-custom">
						<span class="text-secondary font-medium">{t('stats.activeAddresses')}</span>
						<span class="text-primary font-bold text-lg">{stats.activeAddresses.toLocaleString()}</span>
					</div>
					<div class="flex justify-between items-center py-3">
						<span class="text-secondary font-medium">{t('stats.avgBlockTime')}</span>
						<span class="text-primary font-bold text-lg">{stats.avgBlockTime}</span>
					</div>
				</div>
			</div>
		</Card>
	{/if}
</div>

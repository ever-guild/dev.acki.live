<script lang="ts">
	import { onMount } from 'svelte';
	import { getBlocks, type Block } from '$lib/services/blockchain';
	import { translate } from '$lib/stores/i18n';
	import Card from '$lib/components/ui/Card.svelte';
	import ErrorCard from '$lib/components/ui/ErrorCard.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
	import LiveTimestamp from '$lib/components/ui/LiveTimestamp.svelte';

	let blocks: Block[] = [];
	let loading = true;
	let error: string | null = null;
	$: t = $translate;

	onMount(async () => {
		try {
			blocks = await getBlocks();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load blocks';
		} finally {
			loading = false;
		}
	});

	function formatHash(hash: string): string {
		return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
	}

	function formatAddress(address: string): string {
		return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
	}
</script>

<div class="page-container">
	<h1 class="page-title">{t('blocks.title')}</h1>

	<Card>
		<div class="table-wrapper">
			{#if loading}
				<SkeletonLoader>
					<div class="p-6 space-y-4">
						{#each Array(10) as _, i}
							<div class="flex gap-4">
								<div class="skeleton skeleton-text w-20"></div>
								<div class="skeleton skeleton-text flex-1"></div>
								<div class="skeleton skeleton-text w-24"></div>
								<div class="skeleton skeleton-text w-16"></div>
								<div class="skeleton skeleton-text w-32"></div>
							</div>
						{/each}
					</div>
				</SkeletonLoader>
			{:else if error}
				<ErrorCard title="Failed to load blocks" message={error} onRetry={() => window.location.reload()} />
			{:else}
				<table class="data-table">
						<thead class="table-header">
							<tr>
								<th class="table-th">{t('blocks.height')}</th>
								<th class="table-th">{t('blocks.hash')}</th>
								<th class="table-th">{t('blocks.timestamp')}</th>
								<th class="table-th">{t('blocks.txCount')}</th>
							</tr>
						</thead>
					<tbody class="table-body">
						{#each blocks as block}
							<tr class="table-row">
								<td class="table-td">
									<a href="/blocks/{block.hash}" class="block-height hover:text-primary-600">
										#{block.height}
									</a>
								</td>
								<td class="table-td">
									<a href="/blocks/{block.hash}" class="hash-text hover:text-primary-600">
										{formatHash(block.hash)}
									</a>
								</td>
								<td class="table-td">
									<LiveTimestamp timestamp={Math.floor(block.timestamp.getTime() / 1000)} className="time-text" />
								</td>
								<td class="table-td">
									<Badge variant="info">{block.txCount}</Badge>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</Card>
</div>

<style>
</style>

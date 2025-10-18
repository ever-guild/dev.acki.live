<script lang="ts">
	import { onMount } from 'svelte';
	import { getTransactions, type Transaction } from '$lib/services/blockchain';
	import { translate } from '$lib/stores/i18n';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
	import LiveTimestamp from '$lib/components/ui/LiveTimestamp.svelte';

	let transactions: Transaction[] = [];
	let loading = true;
	let error: string | null = null;
	$: t = $translate;

	onMount(async () => {
		try {
			transactions = await getTransactions();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load transactions';
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

	function getStatusVariant(status: string): 'success' | 'info' | 'warning' | 'error' {
		if (status === 'success') return 'success';
		if (status === 'pending') return 'warning';
		return 'error';
	}
</script>

<div class="page-container">
	<h1 class="page-title">{t('transactions.title')}</h1>

	<Card>
		<div class="table-wrapper">
			{#if loading}
				<SkeletonLoader>
					<div class="p-6 space-y-4">
						{#each Array(10) as _, i}
							<div class="flex gap-4">
								<div class="skeleton skeleton-text w-24"></div>
								<div class="skeleton skeleton-text w-20"></div>
								<div class="skeleton skeleton-text w-20"></div>
								<div class="skeleton skeleton-text w-20"></div>
								<div class="skeleton skeleton-text w-16"></div>
								<div class="skeleton skeleton-text w-24"></div>
							</div>
						{/each}
					</div>
				</SkeletonLoader>
			{:else if error}
				<div class="p-8 text-center">
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
					<h3 class="text-lg font-semibold mb-2">Failed to load transactions</h3>
					<p class="text-muted mb-4">{error}</p>
					<button
						class="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
						on:click={() => window.location.reload()}
					>
						Retry
					</button>
				</div>
			{:else}
				<table class="data-table">
						<thead class="table-header">
							<tr>
								<th class="table-th">{t('transactions.hash')}</th>
								<th class="table-th">{t('transactions.from')}</th>
								<th class="table-th">{t('transactions.to')}</th>
								<th class="table-th">{t('transactions.amount')}</th>
								<th class="table-th">{t('transactions.status')}</th>
								<th class="table-th">{t('transactions.time')}</th>
							</tr>
						</thead>
					<tbody class="table-body">
						{#each transactions as tx}
							<tr class="table-row">
								<td class="table-td">
									<a href="/transactions/{tx.hash}" class="hash-text hover:text-primary-600">
										{formatHash(tx.hash)}
									</a>
								</td>
								<td class="table-td">
									<span class="address-text">{formatAddress(tx.from)}</span>
								</td>
								<td class="table-td">
									<span class="address-text">{formatAddress(tx.to)}</span>
								</td>
								<td class="table-td">
									<span class="font-semibold text-primary">{tx.amount.toFixed(4)}</span>
								</td>
								<td class="table-td">
									<Badge variant={getStatusVariant(tx.status)}>
										{t(`status.${tx.status}`)}
									</Badge>
								</td>
								<td class="table-td">
									<LiveTimestamp timestamp={Math.floor(tx.timestamp.getTime() / 1000)} className="time-text" />
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</Card>
</div>

<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { translate } from '$lib/stores/i18n';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
	import LiveTimestamp from '$lib/components/ui/LiveTimestamp.svelte';
	import { environment } from '$lib/environment';

	interface AccountDetails {
		boc: string;
	}

	interface Transaction {
		id: string;
		now: number;
		now_string: string;
		lt: string;
		orig_status_name: string;
		end_status_name: string;
		total_fees: string;
		balance_delta: string;
		in_msg: string | null;
		outmsg_cnt: number;
		aborted: boolean;
		compute?: {
			success: boolean;
			exit_code: number;
		};
		destroyed: boolean;
	}

	$: accountId = $page.params.id;
	$: t = $translate;

	let account: AccountDetails | null = null;
	let transactions: Transaction[] = [];
	let loading = true;
	let error: string | null = null;
	let transactionsLoading = false;

	onMount(async () => {
		await loadAccount();
	});

	async function loadAccount() {
		loading = true;
		error = null;

		try {
			const response = await fetch(environment.graphqlEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'text/plain' },
				body: JSON.stringify({
					query: `
						query GetAccount($address: String!) {
							account(address: $address) {
								info {
									boc
								}
							}
						}
					`,
					variables: { address: accountId }
				})
			});

			const result = await response.json();

			if (result.errors) {
				throw new Error(result.errors[0]?.message || 'Failed to load account');
			}

			if (!result.data?.account?.info) {
				throw new Error('Account not found');
			}

			account = result.data.account.info;
			await loadTransactions();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load account details';
			console.error('Error loading account:', err);
		} finally {
			loading = false;
		}
	}

	async function loadTransactions() {
		transactionsLoading = true;

		try {
			const response = await fetch(environment.graphqlEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'text/plain' },
				body: JSON.stringify({
					query: `
						query GetAccountTransactions($limit: Int!, $address: String!) {
							transactions(
								orderBy: [{ path: "now", direction: DESC }]
								limit: $limit
								filter: { account_addr: { eq: $address } }
							) {
								id
								now
								now_string
								lt
								orig_status_name
								end_status_name
								total_fees(format: DEC)
								balance_delta(format: DEC)
								in_msg
								outmsg_cnt
								aborted
								compute {
									success
									exit_code
								}
								destroyed
							}
						}
					`,
					variables: { address: accountId, limit: 20 }
				})
			});

			const result = await response.json();

			if (result.errors) {
				console.error('Error loading transactions:', result.errors);
			} else if (result.data?.transactions) {
				transactions = result.data.transactions;
			}
		} catch (err) {
			console.error('Error loading transactions:', err);
		} finally {
			transactionsLoading = false;
		}
	}

	function formatAddress(address: string): string {
		return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
	}

	function formatBalance(balance: string): string {
		try {
			const value = parseFloat(balance) / 1e9;
			return value.toFixed(4);
		} catch {
			return '0.0000';
		}
	}

	function formatHash(hash: string): string {
		return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
	}

	function getStatusVariant(status: string): 'success' | 'info' | 'warning' | 'error' {
		if (status === 'finalized') return 'success';
		if (status === 'pending') return 'warning';
		if (status === 'failed') return 'error';
		return 'info';
	}
</script>

<div class="page-container">
	<div class="mb-6">
		<button
			on:click={() => goto('/contracts')}
			class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-2"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"
				></path>
			</svg>
			Back to Contracts
		</button>
	</div>

	<h1 class="page-title">Account Details</h1>

	{#if loading}
		<SkeletonLoader>
			<div class="space-y-6">
				<div class="skeleton skeleton-card h-64"></div>
				<div class="skeleton skeleton-card h-96"></div>
			</div>
		</SkeletonLoader>
	{:else if error}
		<Card>
			<div class="p-8 text-center">
				<div class="text-red-500 mb-4">
					<svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
				</div>
				<h3 class="text-lg font-semibold mb-2">Failed to load account</h3>
				<p class="text-muted mb-4">{error}</p>
				<button
					class="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
					on:click={loadAccount}
				>
					Retry
				</button>
			</div>
		</Card>
	{:else if account}
		<!-- Account Overview -->
		<Card>
			<div class="p-6">
				<h2 class="text-xl font-bold mb-2">Account Overview</h2>
				<div class="grid grid-cols-1 gap-6">
					<div>
						<label class="detail-label">Address</label>
						<p class="detail-value font-mono break-all">{accountId}</p>
					</div>
					<div>
						<label class="detail-label">BOC (Bag of Cells)</label>
						<div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-xs break-all overflow-auto max-h-48">
							{account.boc}
						</div>
					</div>
				</div>
			</div>
		</Card>

		<!-- Transactions -->
		<Card>
			<div class="p-6">
				<h2 class="text-xl font-bold mb-2">Recent Transactions</h2>
				{#if transactionsLoading}
					<SkeletonLoader>
						<div class="space-y-4">
							{#each Array(5) as _, i}
								<div class="skeleton skeleton-text h-16"></div>
							{/each}
						</div>
					</SkeletonLoader>
				{:else if transactions.length === 0}
					<div class="text-center py-8 text-muted">
						<svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
							></path>
						</svg>
						<p>No transactions found for this account</p>
					</div>
				{:else}
					<div class="table-wrapper">
						<table class="data-table">
							<thead class="table-header">
								<tr>
									<th class="table-th">Transaction ID</th>
									<th class="table-th">Status</th>
									<th class="table-th">Balance Change</th>
									<th class="table-th">Fees</th>
									<th class="table-th">Time</th>
								</tr>
							</thead>
							<tbody class="table-body">
								{#each transactions as tx}
									<tr class="table-row">
										<td class="table-td">
											<a
												href="/transactions/{tx.id}"
												class="hash-text hover:text-primary-600 dark:hover:text-primary-400"
											>
												{formatHash(tx.id)}
											</a>
										</td>
										<td class="table-td">
											<Badge variant={getStatusVariant(tx.end_status_name)}>
												{tx.aborted ? 'Aborted' : tx.end_status_name}
											</Badge>
										</td>
										<td class="table-td">
											<span
												class="font-semibold {parseFloat(tx.balance_delta) >= 0
													? 'text-green-600 dark:text-green-400'
													: 'text-red-600 dark:text-red-400'}"
											>
												{parseFloat(tx.balance_delta) >= 0 ? '+' : ''}{formatBalance(
													tx.balance_delta
												)}
											</span>
										</td>
										<td class="table-td">
											<span class="text-muted">{formatBalance(tx.total_fees)}</span>
										</td>
										<td class="table-td">
											<LiveTimestamp timestamp={tx.now} className="time-text" />
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</Card>
	{/if}
</div>

<style lang="scss">
	.detail-label {
		@apply text-sm font-semibold text-muted uppercase tracking-wide mb-1 block;
	}

	.detail-value {
		@apply text-base text-gray-900 dark:text-gray-100;
	}

	.time-text {
		@apply text-muted text-sm;
	}

	.hash-text {
		@apply font-mono text-sm;
	}
</style>

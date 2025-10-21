<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { translate } from '$lib/stores/i18n';
	import Card from '$lib/components/ui/Card.svelte';
	import ErrorCard from '$lib/components/ui/ErrorCard.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
	import { environment } from '$lib/environment';

	interface TransactionDetails {
		id: string;
		account_addr: string;
		now: number;
		aborted: boolean;
		balance_delta: string;
		total_fees: string;
		status_name: string;
		orig_status_name: string;
		end_status_name: string;
		tr_type_name: string;
		workchain_id: number;
		compute?: {
			success: boolean;
			exit_code: number;
			gas_used: string;
			gas_fees: string;
		};
		in_message?: {
			id: string;
			src: string;
			dst: string;
			value: string;
			msg_type_name: string;
		};
		out_messages?: Array<{
			id: string;
			src: string;
			dst: string;
			value: string;
		}>;
	}

	$: txId = $page.params.id;
	$: t = $translate;

	let transaction: TransactionDetails | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		await loadTransaction();
	});

	async function loadTransaction() {
		loading = true;
		error = null;

		try {
			const response = await fetch(environment.graphqlEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'text/plain' },
				body: JSON.stringify({
					query: `
						query GetTransaction($hash: String!) {
							blockchain {
								transaction(hash: $hash) {
									id
									account_addr
									now
									aborted
									balance_delta(format: DEC)
									total_fees(format: DEC)
									status_name
									orig_status_name
									end_status_name
									tr_type_name
									workchain_id
									compute {
										success
										exit_code
										gas_used(format: DEC)
										gas_fees(format: DEC)
									}
									in_message {
										id
										src
										dst
										value(format: DEC)
										msg_type_name
									}
									out_messages {
										id
										src
										dst
										value(format: DEC)
									}
								}
							}
						}
					`,
					variables: { hash: txId }
				})
			});

			const data = await response.json();

			if (data.errors) {
				throw new Error(data.errors[0].message);
			}

			if (data.data?.blockchain?.transaction) {
				transaction = data.data.blockchain.transaction;
			} else {
				throw new Error('Transaction not found');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load transaction';
		} finally {
			loading = false;
		}
	}

	function formatTime(timestamp: number): string {
		return new Date(timestamp * 1000).toLocaleString();
	}

	function formatValue(value: string): string {
		const num = parseFloat(value);
		return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
	}

	function formatAddress(address: string): string {
		return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
	}

	function getStatusVariant(aborted: boolean): 'success' | 'error' {
		return aborted ? 'error' : 'success';
	}
</script>

<svelte:head>
	<title>Transaction {txId ? formatAddress(txId) : ''} - acki.live</title>
</svelte:head>

<div class="page-container">
	<div class="mb-4">
			<button
			on:click={() => goto('/transactions')}
			class="text-primary hover:text-primary-600 flex items-center gap-2"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			{t('transactions.details.back')}
		</button>
	</div>

	<h1 class="page-title">{t('transactions.details.title')}</h1>

	{#if loading}
		<SkeletonLoader>
			<div class="space-y-6">
				<div class="skeleton skeleton-rect h-64"></div>
				<div class="skeleton skeleton-rect h-48"></div>
			</div>
		</SkeletonLoader>
	{:else if error}
		<Card>
			<ErrorCard title="Failed to load transaction" message={error} onRetry={loadTransaction} />
		</Card>
	{:else if transaction}
		<Card>
			<div class="p-6">
				<h2 class="text-2xl font-bold text-primary mb-2">{t('transactions.details.overview')}</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="detail-item">
						<div class="detail-label">{t('transactions.details.txId')}</div>
						<div class="detail-value font-mono text-sm break-all">
							{transaction.id}
							<button
								on:click={() => copyToClipboard(transaction?.id || '')}
								class="ml-2 text-primary hover:text-primary-600"
								title="Copy"
							>
								<svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
									/>
								</svg>
							</button>
						</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">{t('transactions.details.status')}</div>
						<div class="detail-value">
							<Badge variant={getStatusVariant(transaction.aborted)}>
								{transaction.aborted ? 'Failed' : 'Success'}
							</Badge>
						</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">{t('transactions.details.accountAddress')}</div>
						<div class="detail-value font-mono text-sm">{transaction.account_addr}</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">{t('transactions.details.timestamp')}</div>
						<div class="detail-value">{formatTime(transaction.now)}</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">{t('transactions.details.balanceDelta')}</div>
						<div class="detail-value">{formatValue(transaction.balance_delta)}</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">{t('transactions.details.totalFees')}</div>
						<div class="detail-value text-red-600">{formatValue(transaction.total_fees)}</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">{t('transactions.details.type')}</div>
						<div class="detail-value">{transaction.tr_type_name}</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">{t('transactions.details.workchainId')}</div>
						<div class="detail-value">{transaction.workchain_id}</div>
					</div>
				</div>
			</div>
		</Card>

		{#if transaction.compute}
			<Card>
				<div class="p-6">
					<h2 class="text-2xl font-bold text-primary mb-2">{t('transactions.details.computePhase')}</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<div class="detail-item">
							<div class="detail-label">{t('transactions.details.compute.success')}</div>
							<div class="detail-value">
								<Badge variant={transaction.compute.success ? 'success' : 'error'}>
									{transaction.compute.success ? 'Yes' : 'No'}
								</Badge>
							</div>
						</div>

						<div class="detail-item">
							<div class="detail-label">{t('transactions.details.compute.exitCode')}</div>
							<div class="detail-value">{transaction.compute.exit_code}</div>
						</div>

						<div class="detail-item">
							<div class="detail-label">{t('transactions.details.compute.gasUsed')}</div>
							<div class="detail-value">{formatValue(transaction.compute.gas_used)}</div>
						</div>

						<div class="detail-item">
							<div class="detail-label">{t('transactions.details.compute.gasFees')}</div>
							<div class="detail-value">{formatValue(transaction.compute.gas_fees)}</div>
						</div>
					</div>
				</div>
			</Card>
		{/if}

		{#if transaction.in_message}
			<Card>
				<div class="p-6">
					<h2 class="text-2xl font-bold text-primary mb-2">{t('transactions.details.inputMsg')}</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="detail-item">
							<div class="detail-label">{t('common.from')}</div>
							<div class="detail-value font-mono text-sm">{transaction.in_message.src}</div>
						</div>

						<div class="detail-item">
							<div class="detail-label">{t('common.to')}</div>
							<div class="detail-value font-mono text-sm">{transaction.in_message.dst}</div>
						</div>

						<div class="detail-item">
							<div class="detail-label">{t('common.value')}</div>
							<div class="detail-value">{formatValue(transaction.in_message.value)}</div>
						</div>

						<div class="detail-item">
							<div class="detail-label">Message Type</div>
							<div class="detail-value">{transaction.in_message.msg_type_name}</div>
						</div>
					</div>
				</div>
			</Card>
		{/if}

		{#if transaction.out_messages && transaction.out_messages.length > 0}
			<Card>
				<div class="p-6">
					<h2 class="text-2xl font-bold text-primary mb-2">{t('transactions.details.outputMsgs')} ({transaction.out_messages.length})</h2>
					<div class="space-y-4">
						{#each transaction.out_messages as msg, i}
							<div class="border border-custom rounded-lg p-4">
								<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div class="detail-item">
										<div class="detail-label">{t('common.from')}</div>
										<div class="detail-value font-mono text-xs">{msg.src}</div>
									</div>

									<div class="detail-item">
										<div class="detail-label">{t('common.to')}</div>
										<div class="detail-value font-mono text-xs">{msg.dst}</div>
									</div>

									<div class="detail-item">
										<div class="detail-label">{t('common.value')}</div>
										<div class="detail-value">{formatValue(msg.value)}</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</Card>
		{/if}
	{/if}
</div>

<style>
	.detail-item {
		@apply flex flex-col space-y-2;
	}

	.detail-label {
		@apply text-sm font-medium uppercase tracking-wide;
		color: var(--text-muted);
	}

	.detail-value {
		@apply text-lg font-semibold;
		color: var(--text-primary);
	}
</style>

<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { translate } from '$lib/stores/i18n';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
	import { environment } from '$lib/environment';

	interface BlockDetails {
		id: string;
		seq_no: number;
		gen_utime: number;
		gen_utime_string: string;
		workchain_id: number;
		shard: string;
		tr_count: number;
		status_name: string;
		key_block: boolean;
		hash: string;
		master_seq_no: number;
		after_split: boolean;
		before_split: boolean;
		value_flow?: {
			created: string;
			exported: string;
			fees_collected: string;
			from_prev_blk: string;
			imported: string;
			minted: string;
		};
	}

	$: blockId = $page.params.id;
	$: t = $translate;

	let block: BlockDetails | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		await loadBlock();
	});

	async function loadBlock() {
		loading = true;
		error = null;

		try {
			const response = await fetch(environment.graphqlEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'text/plain' },
				body: JSON.stringify({
					query: `
						query GetBlock($hash: String!) {
							blockchain {
								block(hash: $hash) {
									id
									seq_no
									gen_utime
									gen_utime_string
									workchain_id
									shard
									tr_count
									status_name
									key_block
									hash
									master_seq_no
									after_split
									before_split
									value_flow {
										created
										exported
										fees_collected
										from_prev_blk
										imported
										minted
									}
								}
							}
						}
					`,
					variables: { hash: blockId }
				})
			});

			const data = await response.json();

			if (data.errors) {
				throw new Error(data.errors[0].message);
			}

			if (data.data?.blockchain?.block) {
				block = data.data.blockchain.block;
			} else {
				throw new Error('Block not found');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load block details';
		} finally {
			loading = false;
		}
	}

	function formatTime(timestamp: number): string {
		return new Date(timestamp * 1000).toLocaleString();
	}

	function formatValue(value?: string): string {
		if (!value) return '0';
		const num = parseFloat(value);
		return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
	}
</script>

<svelte:head>
	<title>Block #{block?.seq_no || blockId} - acki.live</title>
</svelte:head>

<div class="page-container">
	<div class="mb-4">
		<button
			on:click={() => goto('/blocks')}
			class="text-primary hover:text-primary-600 flex items-center gap-2"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 19l-7-7 7-7"
				/>
			</svg>
			Back to Blocks
		</button>
	</div>

	<h1 class="page-title">Block Details</h1>

	{#if loading}
		<SkeletonLoader>
			<div class="space-y-6">
				<div class="skeleton skeleton-rect h-64"></div>
				<div class="skeleton skeleton-rect h-48"></div>
				<div class="skeleton skeleton-rect h-48"></div>
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
						/>
					</svg>
				</div>
				<h3 class="text-lg font-semibold mb-2">Failed to load block</h3>
				<p class="text-muted mb-4">{error}</p>
				<button
					class="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
					on:click={loadBlock}
				>
					Retry
				</button>
			</div>
		</Card>
	{:else if block}
		<!-- Overview Card -->
		<Card>
			<div class="p-6">
				<h2 class="text-2xl font-bold text-primary mb-2">Overview</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="detail-item">
						<div class="detail-label">Block Height</div>
						<div class="detail-value">#{block.seq_no}</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">Status</div>
						<div class="detail-value">
							<Badge variant={block.status_name === 'finalized' ? 'success' : 'info'}>
								{block.status_name}
							</Badge>
						</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">Hash</div>
						<div class="detail-value font-mono text-sm break-all">
							{block.hash}
							<button
								on:click={() => copyToClipboard(block?.hash || '')}
								class="ml-2 text-primary hover:text-primary-600"
								title="Copy to clipboard"
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
						<div class="detail-label">Timestamp</div>
						<div class="detail-value">{formatTime(block.gen_utime)}</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">Transactions</div>
						<div class="detail-value">{block.tr_count}</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">Workchain ID</div>
						<div class="detail-value">{block.workchain_id}</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">Shard</div>
						<div class="detail-value font-mono text-sm">{block.shard}</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">Master Sequence No</div>
						<div class="detail-value">{block.master_seq_no}</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">Key Block</div>
						<div class="detail-value">
							<Badge variant={block.key_block ? 'success' : 'info'}>
								{block.key_block ? 'Yes' : 'No'}
							</Badge>
						</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">Split Status</div>
						<div class="detail-value">
							{#if block.after_split}
								<Badge variant="warning">After Split</Badge>
							{:else if block.before_split}
								<Badge variant="warning">Before Split</Badge>
							{:else}
								<Badge variant="info">Normal</Badge>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</Card>

		<!-- Value Flow Card -->
		{#if block.value_flow}
			<Card>
				<div class="p-6">
					<h2 class="text-2xl font-bold text-primary mb-2">Value Flow</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<div class="detail-item">
							<div class="detail-label">Created</div>
							<div class="detail-value">{formatValue(block.value_flow.created)}</div>
						</div>

						<div class="detail-item">
							<div class="detail-label">Imported</div>
							<div class="detail-value">{formatValue(block.value_flow.imported)}</div>
						</div>

						<div class="detail-item">
							<div class="detail-label">Exported</div>
							<div class="detail-value">{formatValue(block.value_flow.exported)}</div>
						</div>

						<div class="detail-item">
							<div class="detail-label">Fees Collected</div>
							<div class="detail-value text-green-600">
								{formatValue(block.value_flow.fees_collected)}
							</div>
						</div>

						<div class="detail-item">
							<div class="detail-label">Minted</div>
							<div class="detail-value">{formatValue(block.value_flow.minted)}</div>
						</div>

						<div class="detail-item">
							<div class="detail-label">From Previous Block</div>
							<div class="detail-value">{formatValue(block.value_flow.from_prev_block)}</div>
						</div>
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

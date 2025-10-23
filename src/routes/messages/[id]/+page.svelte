<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { translate } from '$lib/stores/i18n';
	import Card from '$lib/components/ui/Card.svelte';
	import ErrorCard from '$lib/components/ui/ErrorCard.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
	import AccountLink from '$lib/components/ui/AccountLink.svelte';
	import { environment } from '$lib/environment';

	interface MessageDetails {
		id: string;
		src: string;
		dst: string;
		value: string;
		created_at: number;
		msg_type_name: string;
		status_name?: string;
		bounce: boolean;
		bounced: boolean;
		body?: string;
		body_hash?: string;
		fwd_fee?: string;
		ihr_fee?: string;
		block_id?: string;
		transaction_id?: string;
	}

	$: msgId = $page.params.id;
	$: t = $translate;

	let message: MessageDetails | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		await loadMessage();
	});

	async function loadMessage() {
		loading = true;
		error = null;

		try {
			const response = await fetch(environment.graphqlEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'text/plain' },
				body: JSON.stringify({
					query: `
						query GetMessage($hash: String!) {
							blockchain {
								message(hash: $hash) {
									id
									src
									dst
									value(format: DEC)
									created_at
									msg_type_name
									status_name
									bounce
									bounced
									body
									body_hash
									fwd_fee(format: DEC)
									ihr_fee(format: DEC)
									block_id
									transaction_id
								}
							}
						}
					`,
					variables: { hash: msgId }
				})
			});

			const data = await response.json();

			if (data.errors) {
				throw new Error(data.errors[0].message);
			}

			if (data.data?.blockchain?.message) {
				message = data.data.blockchain.message;
			} else {
				throw new Error('Message not found');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load message';
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
</script>

<svelte:head>
	<title>Message {msgId ? formatAddress(msgId) : ''} - acki.live</title>
</svelte:head>

<div class="page-container">
	<div class="mb-4">
		<button
			on:click={() => goto('/messages')}
			class="text-primary hover:text-primary-600 flex items-center gap-2"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Back to Messages
		</button>
	</div>

	<h1 class="page-title">Message Details</h1>

	{#if loading}
		<SkeletonLoader>
			<div class="space-y-6">
				<div class="skeleton skeleton-rect h-64"></div>
				<div class="skeleton skeleton-rect h-48"></div>
			</div>
		</SkeletonLoader>
	{:else if error}
		<Card>
			<ErrorCard title="Failed to load message" message={error} onRetry={loadMessage} />
		</Card>
	{:else if message}
		<Card>
			<div class="p-6">
				<h2 class="text-2xl font-bold text-primary mb-2">Overview</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="detail-item">
						<div class="detail-label">Message ID</div>
						<div class="detail-value font-mono text-sm break-all">
							{message.id}
							<button
								on:click={() => copyToClipboard(message?.id || '')}
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
						<div class="detail-label">Message Type</div>
						<div class="detail-value">
							<Badge variant="info">{message.msg_type_name}</Badge>
						</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">From</div>
						<div class="detail-value font-mono text-sm break-all">
              <AccountLink address={message.src} showFullAddress={true} />
            </div>
					</div>

					<div class="detail-item">
						<div class="detail-label">To</div>
						<div class="detail-value font-mono text-sm break-all">
              <AccountLink address={message.dst} showFullAddress={true} />
            </div>
					</div>

					<div class="detail-item">
						<div class="detail-label">Value</div>
						<div class="detail-value">{formatValue(message.value)}</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">Created At</div>
						<div class="detail-value">{formatTime(message.created_at)}</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">Bounce</div>
						<div class="detail-value">
							<Badge variant={message.bounce ? 'warning' : 'info'}>
								{message.bounce ? 'Yes' : 'No'}
							</Badge>
						</div>
					</div>

					<div class="detail-item">
						<div class="detail-label">Bounced</div>
						<div class="detail-value">
							<Badge variant={message.bounced ? 'error' : 'success'}>
								{message.bounced ? 'Yes' : 'No'}
							</Badge>
						</div>
					</div>

					{#if message.fwd_fee}
						<div class="detail-item">
							<div class="detail-label">Forward Fee</div>
							<div class="detail-value">{formatValue(message.fwd_fee)}</div>
						</div>
					{/if}

					{#if message.ihr_fee}
						<div class="detail-item">
							<div class="detail-label">IHR Fee</div>
							<div class="detail-value">{formatValue(message.ihr_fee)}</div>
						</div>
					{/if}

					{#if message.block_id}
						<div class="detail-item">
							<div class="detail-label">Block ID</div>
							<div class="detail-value font-mono text-sm break-all">
								<a href="/blocks/{message.block_id}" class="text-primary hover:text-primary-600">
									{message.block_id}
								</a>
							</div>
						</div>
					{/if}

					{#if message.transaction_id}
						<div class="detail-item">
							<div class="detail-label">Transaction ID</div>
							<div class="detail-value font-mono text-sm break-all">
								<a href="/transactions/{message.transaction_id}" class="text-primary hover:text-primary-600">
									{message.transaction_id}
								</a>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</Card>

		{#if message.body}
			<Card>
				<div class="p-6">
					<h2 class="text-2xl font-bold text-primary mb-2">Message Body</h2>
					<div class="bg-tertiary rounded-lg p-4 font-mono text-sm break-all overflow-auto max-h-96">
						{message.body}
					</div>
					{#if message.body_hash}
						<div class="mt-4 text-sm text-muted">
							Body Hash: <span class="font-mono">{message.body_hash}</span>
						</div>
					{/if}
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

	.bg-tertiary {
		background-color: var(--bg-tertiary);
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { getMessages, type Message } from '$lib/services/blockchain';
	import { translate } from '$lib/stores/i18n';
	import Card from '$lib/components/ui/Card.svelte';
	import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
	import LiveTimestamp from '$lib/components/ui/LiveTimestamp.svelte';

	let messages: Message[] = [];
	let loading = true;
	let error: string | null = null;
	$: t = $translate;

	onMount(async () => {
		try {
			messages = await getMessages();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load messages';
		} finally {
			loading = false;
		}
	});

	function formatAddress(address: string): string {
		return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
	}

	function formatData(data: string): string {
		if (data.length > 50) {
			return `${data.substring(0, 50)}...`;
		}
		return data;
	}

	function formatValue(value?: string): string {
		if (!value || value === '0') return '0';
		const num = parseFloat(value);
		if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
		if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
		if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
		return num.toFixed(4);
	}
</script>

<div class="page-container">
	<h1 class="page-title">{t('messages.title')}</h1>

	<Card>
		<div class="table-wrapper">
			{#if loading}
				<SkeletonLoader>
					<div class="p-6 space-y-4">
						{#each Array(10) as _, i}
							<div class="flex gap-4">
								<div class="skeleton skeleton-text w-24"></div>
								<div class="skeleton skeleton-text w-24"></div>
								<div class="skeleton skeleton-text w-20"></div>
								<div class="skeleton skeleton-text flex-1"></div>
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
					<h3 class="text-lg font-semibold mb-2">Failed to load messages</h3>
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
								<th class="table-th">{t('messages.sender')}</th>
								<th class="table-th">{t('messages.recipient')}</th>
								<th class="table-th">{t('messages.type')}</th>
								<th class="table-th">Value</th>
								<th class="table-th">{t('messages.timestamp')}</th>
							</tr>
						</thead>
					<tbody class="table-body">
						{#each messages as message}
							<tr class="table-row">
								<td class="table-td">
									<a href="/messages/{message.id}" class="address-text hover:text-primary-600">
										{formatAddress(message.from)}
									</a>
								</td>
								<td class="table-td">
									<span class="address-text">{formatAddress(message.to)}</span>
								</td>
								<td class="table-td">
									<span class="text-primary-500 font-medium">{message.type}</span>
								</td>
								<td class="table-td">
									<span class="font-semibold text-primary">{formatValue(message.value)}</span>
								</td>
								<td class="table-td">
									<LiveTimestamp timestamp={Math.floor(message.timestamp.getTime() / 1000)} className="time-text" />
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</Card>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { getMessages, type Message } from '$lib/services/blockchain';
	import { translate } from '$lib/stores/i18n';
	import Card from '$lib/components/ui/Card.svelte';
	import ErrorCard from '$lib/components/ui/ErrorCard.svelte';
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
				<ErrorCard title="Failed to load messages" message={error} onRetry={() => window.location.reload()} />
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

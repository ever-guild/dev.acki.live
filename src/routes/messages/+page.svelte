<script lang="ts">
	import { onMount } from 'svelte';
	import graphql, { type Message } from '$lib/services/graphql';
	import { translate } from '$lib/stores/i18n';
	import Card from '$lib/components/ui/Card.svelte';
	import ErrorCard from '$lib/components/ui/ErrorCard.svelte';
	import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
	import LiveTimestamp from '$lib/components/ui/LiveTimestamp.svelte';
  import { formatAddress, formatStringAsNumber } from '$lib/utils/formatters';
  import tvmClient from '$lib/services/tvmClient';

	let messages: Message[] = [];
	let loading = true;
	let error: string | null = null;
	$: t = $translate;

	onMount(async () => {
		try {
			messages = await graphql.getMessages();
		} catch (err) {
      console.log('Error loading messages:', err);
			error = err instanceof Error ? err.message : 'Failed to load messages';
		} finally {
			loading = false;
		}
	});

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
								<div class="skeleton skeleton-text flex-1"></div>
								<div class="skeleton skeleton-text flex-1"></div>
								<div class="skeleton skeleton-text w-20"></div>
								<div class="skeleton skeleton-text w-20"></div>
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
								<th class="table-th">{t('messages.from')}</th>
								<th class="table-th">{t('messages.to')}</th>
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
									<span class="font-semibold text-primary">{formatStringAsNumber(message.value)}</span>
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

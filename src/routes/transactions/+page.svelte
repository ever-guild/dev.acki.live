<script lang="ts">
  import { onMount } from 'svelte';
  import graphql, { type Transaction } from '$lib/services/graphql';
  import { translate } from '$lib/stores/i18n';
  import Card from '$lib/components/ui/Card.svelte';
  import ErrorCard from '$lib/components/ui/ErrorCard.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
  import LiveTimestamp from '$lib/components/ui/LiveTimestamp.svelte';
  import { formatHash } from '$lib/utils/formatters';
  import AccountLink from '$lib/components/ui/AccountLink.svelte';

  let transactions: Transaction[] = [];
  let loading = true;
  let error: string | null = null;
  $: t = $translate;

  onMount(async () => {
    try {
      transactions = await graphql.getLatestTransactions();
    } catch (err) {
      error =
        err instanceof Error ? err.message : 'Failed to load transactions';
    } finally {
      loading = false;
    }
  });

  function getStatusVariant(
    status: string,
  ): 'success' | 'info' | 'warning' | 'error' {
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
                <div class="skeleton skeleton-text flex-1"></div>
                <div class="skeleton skeleton-text flex-1"></div>
                <div class="skeleton skeleton-text flex-1"></div>
                <div class="skeleton skeleton-text w-20"></div>
                <div class="skeleton skeleton-text w-16"></div>
                <div class="skeleton skeleton-text w-24"></div>
              </div>
            {/each}
          </div>
        </SkeletonLoader>
      {:else if error}
        <ErrorCard
          title={t('transactions.loadErrorTitle')}
          message={error}
          onRetry={() => window.location.reload()}
        />
      {:else}
        <table class="data-table">
          <thead class="table-header">
            <tr>
              <th class="table-th">{t('transactions.hash')}</th>
              <th class="table-th">{t('common.from')}</th>
              <th class="table-th">{t('common.to')}</th>
              <th class="table-th">{t('common.amount')}</th>
              <th class="table-th">{t('common.status')}</th>
              <th class="table-th">{t('common.time')}</th>
            </tr>
          </thead>
          <tbody class="table-body">
            {#each transactions as tx}
              <tr class="table-row">
                <td class="table-td">
                  <a
                    href="/transactions/{tx.hash}"
                    class="hash-text hover:text-primary-600"
                  >
                    {formatHash(tx.hash)}
                  </a>
                </td>
                <td class="table-td">
                  <span class="address-text">
                    <AccountLink address={tx.from} />
                  </span>
                </td>
                <td class="table-td">
                  <span class="address-text">
                    <AccountLink address={tx.to} />
                  </span>
                </td>
                <td class="table-td">
                  <span class="font-semibold text-primary"
                    >{tx.amount.toFixed(4)}</span
                  >
                </td>
                <td class="table-td">
                  <Badge variant={getStatusVariant(tx.status)}>
                    {t(`status.${tx.status}`)}
                  </Badge>
                </td>
                <td class="table-td">
                  <LiveTimestamp
                    timestamp={Math.floor(tx.timestamp.getTime() / 1000)}
                    className="time-text"
                  />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  </Card>
</div>

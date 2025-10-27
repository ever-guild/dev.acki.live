<script lang="ts">
  function trimMiddle(str: string, maxLength: number): string {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    const part = Math.floor((maxLength - 3) / 2);
    return str.slice(0, part) + '...' + str.slice(str.length - part);
  }
  import { page } from '$app/stores';
  import { translate } from '$lib/stores/i18n';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
  import LiveTimestamp from '$lib/components/ui/LiveTimestamp.svelte';
  import CopyIcon from '$lib/components/ui/CopyIcon.svelte';
  import ErrorCard from '$lib/components/ui/ErrorCard.svelte';
  import graphql from '$lib/services/graphql';
  import {
    getAccountDetails,
    type AccountDetails,
    AccountType,
  } from '$lib/services/blockchain';
  import { formatBalance, formatHash } from '$lib/utils/formatters';

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

  $: accountOrName = $page.params.id ?? '';
  $: t = $translate;

  let account: AccountDetails | null = null;
  let accountName: string | null = null;
  let linkedAccounts: Map<AccountType, string> = new Map();
  let transactions: Transaction[] = [];
  let accountLoading = true;
  let error: string | null = null;
  let transactionsLoading = false;

  // For route-change reloading and concurrency guards
  let lastLoadedAccountOrName = '';
  let loadToken = 0; // incremented for each load to avoid races

  // Trigger initial and subsequent loads when the route param changes
  import { browser } from '$app/environment';

  $: if (
    browser &&
    accountOrName &&
    accountOrName !== lastLoadedAccountOrName
  ) {
    lastLoadedAccountOrName = accountOrName;
    loadAccount(accountOrName);
  }

  async function loadAccount(accountParam: string = accountOrName) {
    const token = ++loadToken;
    accountLoading = true;
    error = null;
    account = null; // clear previous data while loading

    try {
      const accountDetails = await getAccountDetails(accountParam);
      if (!accountDetails) {
        throw new Error('Account not found');
      }
      // If a newer load started, bail out
      if (token !== loadToken) return;
      account = accountDetails;
      // cache the computed name so the template won't need to call getName() again
      accountName = await account.getName?.();

      account.getLinkedAccounts().then((accounts) => {
        linkedAccounts = accounts;

        if (linkedAccounts.has(AccountType.PopitGame)) {
          const popitGameAddress = linkedAccounts.get(AccountType.PopitGame)!;
          getAccountDetails(popitGameAddress).then((popitGameAccount) => {
            if (!popitGameAccount) return;

            const extraBalance = {
              id: 0,
              name: 'NACKL locked in PopitGame',
              value:
                popitGameAccount.balances.find((bal) => bal.name === 'NACKL')
                  ?.value || 0,
            };

            account!.balances = [...account!.balances, extraBalance];
          });
        }
      });

      // load transactions for this account id (use local accountDetails to avoid null checks)
      loadTransactions(account.id, token);
    } catch (err) {
      if (token !== loadToken) return;
      error =
        err instanceof Error ? err.message : 'Failed to load account details';
      console.error('Error loading account:', err);
    } finally {
      if (token === loadToken) accountLoading = false;
    }
  }

  async function loadTransactions(accountId: string, token: number) {
    transactionsLoading = true;

    try {
      const txs = await graphql.getAccountTransactions(accountId);
      if (token !== loadToken) return;
      transactions = txs;
    } catch (err) {
      if (token !== loadToken) return;
      console.error('Error loading transactions:', err);
    } finally {
      if (token === loadToken) transactionsLoading = false;
    }
  }

  function getStatusVariant(
    status: string,
  ): 'success' | 'info' | 'warning' | 'error' {
    if (status === 'finalized') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'failed') return 'error';
    return 'info';
  }
</script>

<div class="page-container">
  <h1 class="page-title flex items-center gap-3">
    {t('account.title')}
    {#if account}
      {#if account.contractName}
        <Badge variant="success">
          {account.contractName}
        </Badge>
      {/if}
      <Badge variant="info">
        {account.accTypeName || `${t('account.type')} ${account.accType}`}
      </Badge>
    {/if}
  </h1>

  {#if accountLoading}
    <SkeletonLoader>
      <div class="space-y-6">
        <div class="skeleton skeleton-card h-64"></div>
        <div class="skeleton skeleton-card h-96"></div>
      </div>
    </SkeletonLoader>
  {:else if error}
    <Card>
      <ErrorCard
        title="Failed to load account"
        message={error}
        onRetry={loadAccount}
      />
    </Card>
  {:else if account}
    <!-- Account Overview -->
    <Card>
      <div class="p-4">
        <div class="table-wrapper overview-table-wrapper">
          <table class="table overview-table">
            <tbody>
              <tr>
                <td class="table-label">{t('common.address')}</td>
                <td class="table-value">
                  <div class="flex items-center gap-2">
                    <span class="font-mono addr-text" title={account.id}>
                      {account.id}
                    </span>
                    <button class="copy-btn" aria-label="Copy address">
                      <CopyIcon value={account.id} size={20} />
                    </button>
                  </div>
                </td>
              </tr>
              {#if accountName}
                <tr>
                  <td class="table-label">{t('account.name')}</td>
                  <td class="table-value">
                    <span class="detail-value">{accountName}</span>
                  </td>
                </tr>
              {/if}
              {#if account.balances && account.balances.length > 0}
                <tr>
                  <td class="table-label">{t('account.balance')}</td>
                  <td class="table-value">
                    <ul class="value-list">
                      {#each account.balances as bal}
                        <li class="value-list-item">
                          <span class="detail-value text-sm"
                            >{(bal.value / 1e9).toFixed(4)}</span
                          >
                          <span class="text-sm text-gray-500">{bal.name}</span>
                        </li>
                      {/each}
                    </ul>
                  </td>
                </tr>
              {/if}
              <tr>
                <td class="table-label">{t('account.lastPaid')}</td>
                <td class="table-value">
                  {#if account.lastPaid.getTime() !== 0}
                  <LiveTimestamp
                    timestamp={account.lastPaid.getTime() / 1000}
                    className="time-text"
                  />
                  {:else}
                    genesis
                  {/if}
                </td>
              </tr>
              {#if linkedAccounts && linkedAccounts.size > 0}
                <tr>
                  <td class="table-label">{t('account.linkedAccounts')}</td>
                  <td class="table-value">
                    <ul class="value-list">
                      {#each linkedAccounts as [type, addr]}
                        <li class="value-list-item">
                          <a
                            href={`/accounts/${addr}`}
                            class="address-text hover:text-primary-600"
                          >
                            {type} - {trimMiddle(addr, 36)}
                          </a>
                        </li>
                      {/each}
                    </ul>
                  </td>
                </tr>
              {/if}
            </tbody>
          </table>
        </div>
      </div>
    </Card>

    <!-- Recent Transactions (moved up) -->
    <Card>
      <div class="recent-transactions p-6">
        <h2 class="text-xl font-bold mb-2">
          {t('account.recentTransactions')}
        </h2>
        {#if transactionsLoading}
          <SkeletonLoader>
            <div class="space-y-4">
              {#each Array(5) as _, i}
                <div class="skeleton skeleton-text h-16"></div>
              {/each}
            </div>
          </SkeletonLoader>
        {:else if transactions.length === 0}
          <div class="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg
              class="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              ></path>
            </svg>
            <p>{t('account.noTransactions')}</p>
          </div>
        {:else}
          <div class="table-wrapper">
            <table class="data-table">
              <thead class="table-header">
                <tr>
                  <th class="table-th">{t('account.txId')}</th>
                  <th class="table-th">{t('common.status')}</th>
                  <th class="table-th">{t('account.balanceChange')}</th>
                  <th class="table-th">{t('account.fees')}</th>
                  <th class="table-th">{t('common.time')}</th>
                </tr>
              </thead>
              <tbody class="table-body">
                {#each transactions as tx}
                  <tr class="table-row">
                    <td class="table-td">
                      <div class="addr-row">
                        <a
                          href="/transactions/{tx.id}"
                          class="hash-text hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          {formatHash(tx.id)}
                        </a>
                        <button class="copy-btn" aria-label="Copy address">
                          <CopyIcon value={tx.id} size={20} />
                        </button>
                      </div>
                    </td>
                    <td class="table-td">
                      <Badge variant={getStatusVariant(tx.end_status_name)}>
                        {tx.aborted ? t('account.aborted') : tx.end_status_name}
                      </Badge>
                    </td>
                    <td class="table-td">
                      <span
                        class="font-semibold {parseFloat(tx.balance_delta) >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'}"
                      >
                        {parseFloat(tx.balance_delta) >= 0
                          ? '+'
                          : ''}{formatBalance(tx.balance_delta)}
                      </span>
                    </td>
                    <td class="table-td">
                      <span class="text-gray-500 dark:text-gray-400">
                        {formatBalance(tx.total_fees)}
                      </span>
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

      <div class="mobile-recent-transactions">
        <h2 class="text-xl font-bold p-6 pb-1">
          {t('account.recentTransactions')}
        </h2>

        {#if transactionsLoading}
          <SkeletonLoader>
            <div class="mobile-table-wrapper">
              {#each Array.from({ length: 3 }) as _}
                <div class="mobile-table-card">
                  <div class="flex flex-col gap-2">
                    <div class="skeleton skeleton-text h-4 w-24"></div>
                    <div class="skeleton skeleton-text h-4 w-40"></div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <div class="skeleton skeleton-text h-4 w-24"></div>
                    <div class="skeleton skeleton-text h-4 w-28"></div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <div class="skeleton skeleton-text h-4 w-32"></div>
                    <div class="skeleton skeleton-text h-4 w-20"></div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <div class="skeleton skeleton-text h-4 w-20"></div>
                    <div class="skeleton skeleton-text h-4 w-24"></div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <div class="skeleton skeleton-text h-4 w-20"></div>
                    <div class="skeleton skeleton-text h-4 w-32"></div>
                  </div>
                </div>
              {/each}
            </div>
          </SkeletonLoader>
        {:else if transactions.length === 0}
          <div class="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg
              class="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              ></path>
            </svg>
            <p>{t('account.noTransactions')}</p>
          </div>
        {:else}
          <div class="mobile-table-wrapper">
            {#each transactions as tx}
              <tr class="mobile-table-card">
                <td>
                  <label class="detail-label" for="account-code-hash-preview">
                    {t('account.codeHash')}
                  </label>
                  <div class="addr-row">
                    <a
                      href="/transactions/{tx.id}"
                      class="hash-text hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {formatHash(tx.id)}
                    </a>
                    <button class="copy-btn" aria-label="Copy address">
                      <CopyIcon value={tx.id} size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <label class="detail-label" for="account-code-hash-preview">
                    {t('common.status')}
                  </label>
                  <Badge variant={getStatusVariant(tx.end_status_name)}>
                    {tx.aborted ? t('account.aborted') : tx.end_status_name}
                  </Badge>
                </td>
                <td>
                  <label class="detail-label" for="account-code-hash-preview">
                    {t('account.balanceChange')}
                  </label>
                  <span
                    class="font-semibold {parseFloat(tx.balance_delta) >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'}"
                  >
                    {parseFloat(tx.balance_delta) >= 0
                      ? '+'
                      : ''}{formatBalance(tx.balance_delta)}
                  </span>
                </td>
                <td>
                  <label class="detail-label" for="account-code-hash-preview">
                    {t('account.fees')}
                  </label>
                  <span class="text-gray-500 dark:text-gray-400">
                    {formatBalance(tx.total_fees)}
                  </span>
                </td>
                <td>
                  <label class="detail-label" for="account-code-hash-preview">
                    {t('common.time')}
                  </label>
                  <LiveTimestamp timestamp={tx.now} className="time-text" />
                </td>
              </tr>
            {/each}
          </div>
        {/if}
      </div>
    </Card>

    <!-- Code and Data (moved down) -->
    {#if account.code || account.data}
      <Card>
        <div class="p-6">
          <h2 class="text-xl font-bold mb-2">{t('account.codeData')}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              {#if account.codeHash}
                <div class="long-field">
                  <label class="detail-label" for="account-code-hash-preview"
                    >{t('account.codeHash')}</label
                  >
                  <div class="long-field-row">
                    <span
                      id="account-code-hash-preview"
                      class="long-text"
                      title={account.codeHash}
                      >{trimMiddle(account.codeHash, 66)}</span
                    >
                    <button class="copy-btn small" aria-label="Copy code hash">
                      <CopyIcon
                        value={account.codeHash}
                        size={18}
                        small={true}
                      />
                    </button>
                  </div>
                </div>
              {/if}

              {#if account.dataHash}
                <div class="long-field">
                  <label class="detail-label" for="account-data-hash-preview"
                    >{t('account.dataHash')}</label
                  >
                  <div class="long-field-row">
                    <span
                      id="account-data-hash-preview"
                      class="long-text"
                      title={account.dataHash}
                      >{trimMiddle(account.dataHash, 66)}</span
                    >
                    <button class="copy-btn small" aria-label="Copy data hash">
                      <CopyIcon
                        value={account.dataHash}
                        size={18}
                        small={true}
                      />
                    </button>
                  </div>
                </div>
              {/if}

              {#if account.initCodeHash}
                <div class="long-field">
                  <label
                    class="detail-label"
                    for="account-init-code-hash-preview"
                    >{t('account.initCodeHash')}</label
                  >
                  <div class="long-field-row">
                    <span
                      id="account-init-code-hash-preview"
                      class="long-text"
                      title={account.initCodeHash}
                      >{trimMiddle(account.initCodeHash, 66)}</span
                    >
                    <button
                      class="copy-btn small"
                      aria-label="Copy init code hash"
                    >
                      <CopyIcon
                        value={account.initCodeHash}
                        size={18}
                        small={true}
                      />
                    </button>
                  </div>
                </div>
              {/if}
              {#if account.code}
                <div class="long-field">
                  <label class="detail-label" for="account-code-preview"
                    >{t('account.code')}</label
                  >
                  <div class="long-field-row">
                    <span
                      id="account-code-preview"
                      class="long-text"
                      title={account.code}>{trimMiddle(account.code, 66)}</span
                    >
                    <button class="copy-btn small" aria-label="Copy code">
                      <CopyIcon value={account.code} size={18} small={true} />
                    </button>
                  </div>
                </div>
              {/if}
            </div>
            <div>
              {#if account.lastTransLt}
                <div class="long-field">
                  <label class="detail-label" for="last-trans-lt"
                    >{t('account.lastTransLt')}</label
                  >
                  <div class="long-field-row">
                    <span
                      id="last-trans-lt"
                      class="long-text"
                      title={String(account.lastTransLt)}
                      >{String(account.lastTransLt)}</span
                    >
                  </div>
                </div>
              {/if}
              {#if account.bits}
                <div class="long-field">
                  <label class="detail-label" for="account-bits"
                    >{t('account.bits')}</label
                  >
                  <div class="long-field-row">
                    <span
                      id="account-bits"
                      class="long-text"
                      title={String(account.bits)}>{String(account.bits)}</span
                    >
                  </div>
                </div>
              {/if}
              {#if account.cells}
                <div class="long-field">
                  <label class="detail-label" for="account-cells"
                    >{t('account.cells')}</label
                  >
                  <div class="long-field-row">
                    <span
                      id="account-cells"
                      class="long-text"
                      title={String(account.cells)}
                      >{String(account.cells)}</span
                    >
                  </div>
                </div>
              {/if}
              {#if account.publicCells}
                <div class="long-field">
                  <label class="detail-label" for="public-cells"
                    >{t('account.publicCells')}</label
                  >
                  <div class="long-field-row">
                    <span
                      id="public-cells"
                      class="long-text"
                      title={String(account.publicCells)}
                      >{String(account.publicCells)}</span
                    >
                  </div>
                </div>
              {/if}

              {#if account.data}
                <div class="long-field">
                  <label class="detail-label" for="account-data-preview"
                    >{t('common.data')}</label
                  >
                  <div class="long-field-row">
                    <span
                      id="account-data-preview"
                      class="long-text"
                      title={account.data}>{trimMiddle(account.data, 66)}</span
                    >
                    <button class="copy-btn small" aria-label="Copy data">
                      <CopyIcon value={account.data} size={18} small={true} />
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </Card>
    {/if}
    {#if account.dataParsed}
      <Card>
        <div class="p-6">
          <h2 class="text-xl font-bold mb-2">{t('account.data')}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <pre><code>{JSON.stringify(account.dataParsed, null, 2)}</code></pre>
          </div>
        </div>
      </Card>
    {/if}
  {/if}
</div>

<style lang="scss">
  .copy-btn {
    background: none;
    border: none;
    padding: 0.15rem 0.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: transform 0.15s;
    position: relative;
  }

  .long-field {
    @apply rounded-md;
    background: transparent;
    padding: 0.15rem 0;
    margin-bottom: 1rem;
  }

  .long-field-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
  }

  .long-text {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono',
      'Courier New', monospace;
  }

  .copy-btn.small {
    padding: 0.1rem 0.2rem;
  }

  .addr-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0; /* allow flex child to shrink */
  }

  .addr-text {
    display: inline-block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .value-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .value-list-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.125rem 0;
  }

  :global(.dark) .value-list-item {
    color: #d1d5db;
  }

  @keyframes pop-fade {
    0% {
      opacity: 0;
      transform: translateY(-8px);
    }
    20% {
      opacity: 1;
      transform: translateY(0);
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(8px);
    }
  }
  .detail-label {
    @apply text-sm font-semibold uppercase tracking-wide mb-1 block text-gray-500;
  }

  :global(.dark) .detail-label {
    @apply text-gray-400;
  }

  .detail-value {
    @apply text-base text-gray-900 dark:text-gray-100;
  }

  :global(.time-text) {
    @apply text-gray-500 text-sm;
  }

  .hash-text {
    @apply font-mono text-sm;
  }

  /* Table Styles */
  .table-wrapper {
    width: 100%;
    overflow-x: auto;
  }
  .overview-table-wrapper {
    overflow-x: visible;
  }
  .table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: auto;
  }
  .table td {
    padding: 0.5rem 1rem 0.5rem 0;
    border-bottom: 1px solid #cbd5e1;
    vertical-align: top;
  }
  .table tr:last-child td {
    border-bottom: none;
  }
  :global(.dark) .table td {
    border-bottom: 1px solid #1e293b;
  }
  :global(.dark) .table tr:last-child td {
    border-bottom: none;
  }
  :global(.dark) .table td {
    border-bottom: 1px solid #1e293b;
  }
  .table-label {
    font-weight: 600;
    color: #374151;
    background: none;
    width: 1px;
    white-space: nowrap;
    max-width: max-content;
  }
  .table-value {
    color: #111827;
    word-break: break-word;
    width: auto;
  }
  :global(.dark) .table-label {
    color: #d1d5db;
  }
  :global(.dark) .table-value {
    color: #f3f4f6;
  }
  	@media (max-width: 640px) {
		.recent-transactions {
			display: none;
		}

		.mobile-table-card {
			display: flex;
			flex-direction: column;
			gap: 10px;
			padding: 20px;
			border-bottom: 1px solid var(--border-color);
		}

    .mobile-table-wrapper {
      display: flex;
      flex-direction: column;
    }

		.overview-table {
			display: block;
			width: 100%;
		}

		.overview-table tbody {
			display: block;
			width: 100%;
		}

		.overview-table tr {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			padding: 1rem;
			border: 1px solid var(--border-color, #e2e8f0);
			border-radius: 0.75rem;
			background-color: #f9fafb;
		}

		.overview-table tr + tr {
			margin-top: 0.75rem;
		}

		.overview-table td {
			padding: 0;
			border: none;
			width: 100%;
		}

		.overview-table .table-label {
			width: 100%;
			white-space: normal;
			font-size: 0.75rem;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: #6b7280;
		}

		:global(.dark) .overview-table tr {
			background-color: #1f2937;
			border-color: #334155;
		}

		:global(.dark) .overview-table .table-label {
			color: #9ca3af;
		}

		.overview-table .table-value {
			width: 100%;
			overflow-wrap: anywhere;
		}

		.overview-table .addr-text,
		.overview-table .address-text {
			white-space: normal;
			word-break: break-word;
			overflow-wrap: anywhere;
		}

		.overview-table .value-list-item {
			align-items: flex-start;
		}
	}

	@media (min-width: 641px) {
		.mobile-recent-transactions {
			display: none;
		}
	}
</style>

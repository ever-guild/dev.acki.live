<script lang="ts">
  function trimMiddle(str: string, maxLength: number): string {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    const part = Math.floor((maxLength - 3) / 2);
    return str.slice(0, part) + '...' + str.slice(str.length - part);
  }
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { translate } from '$lib/stores/i18n';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
  import LiveTimestamp from '$lib/components/ui/LiveTimestamp.svelte';
  import CopyIcon from '$lib/components/ui/CopyIcon.svelte';
  import ErrorCard from '$lib/components/ui/ErrorCard.svelte';
  import graphql from '$lib/services/graphql';
  import { getAccountDetails, type AccountDetails } from '$lib/services/blockchain';
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
  let transactions: Transaction[] = [];
  let accountLoading = true;
  let error: string | null = null;
  let transactionsLoading = false;

  // For route-change reloading and concurrency guards
  let lastLoadedAccountOrName = '';
  let loadToken = 0; // incremented for each load to avoid races
  
  // Trigger initial and subsequent loads when the route param changes
  $: if (accountOrName && accountOrName !== lastLoadedAccountOrName) {
    lastLoadedAccountOrName = accountOrName;
    loadAccount(accountOrName);
  }


  async function loadAccount(accountParam: string = accountOrName) {
    const token = ++loadToken;
    accountLoading = true;
    error = null;
    account = null; // clear previous data while loading

    try {
      const acct = await getAccountDetails(accountParam);
      if (!acct) {
        throw new Error('Account not found');
      }
      // If a newer load started, bail out
      if (token !== loadToken) return;
  account = acct;

  // load transactions for this account id (use local acct to avoid null checks)
  await loadTransactions(acct.id, token);
    } catch (err) {
      if (token !== loadToken) return;
      error = err instanceof Error ? err.message : 'Failed to load account details';
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
    Account
    {#if account}
      <Badge variant="info"
        >{account.accTypeName || `Type ${account.accType}`}</Badge
      >
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
    <!-- Account Overview (compact) -->
    <Card>
      <div class="p-4 flex flex-col gap-2">
        <div class="flex items-center gap-3">
          <span class="detail-label">Address:</span>
          <span class="detail-value font-mono break-all">{account.id}</span>
          <button class="copy-btn" aria-label="Copy address">
            <CopyIcon value={account.id} size={20} />
          </button>
        </div>
        <!-- Type badge moved to page title -->
        {#if account.balances && account.balances.length > 0}
          <div class="flex items-center gap-3">
            <span class="detail-label">Balance:</span>
            {#each account.balances as bal}
              <span class="detail-value text-sm"
                >{(bal.value / 1e9).toFixed(4)} {bal.name}</span
              >
            {/each}
          </div>
        {/if}
        <div class="flex items-center gap-3">
          <span class="detail-label">Last Paid:</span>
          <LiveTimestamp
            timestamp={account.lastPaid.getTime() / 1000}
            className="time-text"
          />
        </div>
      </div>
    </Card>

    <!-- Recent Transactions (moved up) -->
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
                        {parseFloat(tx.balance_delta) >= 0
                          ? '+'
                          : ''}{formatBalance(tx.balance_delta)}
                      </span>
                    </td>
                    <td class="table-td">
                      <span class="text-gray-500 dark:text-gray-400"
                        >{formatBalance(tx.total_fees)}</span
                      >
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

    <!-- Code and Data (moved down) -->
    {#if account.code || account.data}
      <Card>
        <div class="p-6">
          <h2 class="text-xl font-bold mb-2">Code & Data</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              {#if account.codeHash}
                <div class="long-field">
                  <label class="detail-label" for="account-code-hash-preview"
                    >Code Hash</label
                  >
                  <div class="long-field-row">
                    <span
                      id="account-code-hash-preview"
                      class="long-text"
                      title={account.codeHash}
                      >{trimMiddle(account.codeHash, 66)}</span
                    >
                    <button class="copy-btn small" aria-label="Copy code hash">
                      <CopyIcon value={account.codeHash} size={18} small={true} />
                    </button>
                  </div>
                </div>
              {/if}

              {#if account.dataHash}
                <div class="long-field">
                  <label class="detail-label" for="account-data-hash-preview"
                    >Data Hash</label
                  >
                  <div class="long-field-row">
                    <span
                      id="account-data-hash-preview"
                      class="long-text"
                      title={account.dataHash}
                      >{trimMiddle(account.dataHash, 66)}</span
                    >
                    <button class="copy-btn small" aria-label="Copy data hash">
                      <CopyIcon value={account.dataHash} size={18} small={true} />
                    </button>
                  </div>
                </div>
              {/if}

              {#if account.initCodeHash}
                <div class="long-field">
                  <label
                    class="detail-label"
                    for="account-init-code-hash-preview">Init Code Hash</label
                  >
                  <div class="long-field-row">
                    <span
                      id="account-init-code-hash-preview"
                      class="long-text"
                      title={account.initCodeHash}
                      >{trimMiddle(account.initCodeHash, 66)}</span
                    >
                    <button class="copy-btn small" aria-label="Copy init code hash">
                      <CopyIcon value={account.initCodeHash} size={18} small={true} />
                    </button>
                  </div>
                </div>
              {/if}
              {#if account.code}
                <div class="long-field">
                  <label class="detail-label" for="account-code-preview"
                    >Code</label
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
                    >Last Transaction LT</label
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
                  <label class="detail-label" for="account-bits">Bits</label>
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
                  <label class="detail-label" for="account-cells">Cells</label>
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
                    >Public Cells</label
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
                    >Data</label
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
</style>

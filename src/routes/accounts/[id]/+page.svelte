
<script lang="ts">
  function trimMiddle(str: string, maxLength: number): string {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    const part = Math.floor((maxLength - 3) / 2);
    return str.slice(0, part) + '...' + str.slice(str.length - part);
  }
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { translate } from '$lib/stores/i18n';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';
  import LiveTimestamp from '$lib/components/ui/LiveTimestamp.svelte';
  import CopyIcon from '$lib/components/ui/CopyIcon.svelte';
  import ErrorCard from '$lib/components/ui/ErrorCard.svelte';
  import { environment } from '$lib/environment';
  import tvmClient from '$lib/services/tvmClient';
  import { GetAccountQuery } from '$lib/../graphql-queries';

  interface Balance {
    id: number;
    name: string;
    value: number;
  }

  interface AccountDetails {
    accType: number;
    accTypeName: string;
    balances: Balance[];
    bits: number;
    boc: string;
    cells: number;
    code: string;
    codeHash: string;
    data: string;
    dataHash: string;
    id: string;
    initCodeHash: string;
    jsonVersion: number;
    lastPaid: Date;
    lastTransLt: number;
    publicCells: number;
    workchainId: number;
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

  $: accountId = $page.params.id ?? '';
  $: t = $translate;

  let account: AccountDetails | null = null;
  let transactions: Transaction[] = [];
  let loading = true;
  let error: string | null = null;
  let transactionsLoading = false;

  // Copy helpers for small and long fields
  let copied = false;
  let copiedLong: string | null = null;

  function copyAddress() {
    if (!accountId) return;
    navigator.clipboard.writeText(accountId).then(() => {
      copied = true;
      setTimeout(() => (copied = false), 1500);
    });
  }

  function copyLong(value: string) {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      copiedLong = value;
      setTimeout(() => {
        if (copiedLong === value) copiedLong = null;
      }, 1500);
    });
  }

  onMount(async () => {
    await loadAccount();
  });

  async function loadAccount() {
    loading = true;
    error = null;

    try {
      // TODO: pass account from search bar to avoid re-fetching
      const response = await fetch(environment.graphqlEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          query: GetAccountQuery,
          variables: { address: accountId },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to load account');
      }

      if (!result.data?.account?.info) {
        throw new Error('Account not found');
      }

      const accountInfo = result.data.account.info;
      const accountData = await tvmClient.boc.parse_account({
        boc: accountInfo.boc,
      });

      if (!accountData?.parsed) {
        throw new Error('Failed to parse account BOC');
      }

  account = {
        accType: accountData.parsed.acc_type,
        accTypeName: accountData.parsed.acc_type_name,
        balances: accountData.parsed.balance_other
          .map((bo: any) => ({
            id: bo.currency,
            name: bo.currency === 1 ? 'NACKL' : '',
            value: parseInt(bo.value, 16),
          }))
          .concat([
            {
              id: 0,
              name: 'SHELL',
              value: parseInt(accountData.parsed.balance, 16),
            },
          ]),
        bits: parseInt(accountData.parsed.bits, 16),
        boc: accountInfo.boc,
        cells: parseInt(accountData.parsed.cells, 16),
        code: accountData.parsed.code,
        codeHash: accountData.parsed.code_hash,
        data: accountData.parsed.data,
        dataHash: accountData.parsed.data_hash,
        id: accountData.parsed.id,
        initCodeHash: accountData.parsed.init_code_hash,
        jsonVersion: accountData.parsed.json_version,
        lastPaid: new Date(accountData.parsed.last_paid * 1000),
        lastTransLt: parseInt(accountData.parsed.last_trans_lt, 16),
        publicCells: parseInt(accountData.parsed.public_cells, 16),
        workchainId: accountData.parsed.workchain_id,
  };
  // show account details immediately, load transactions asynchronously
  loading = false;

      // kick off transactions loading but don't block rendering
      loadTransactions();
    } catch (err) {
      error =
        err instanceof Error ? err.message : 'Failed to load account details';
      console.error('Error loading account:', err);
    } finally {
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
          variables: { address: accountId, limit: 20 },
        }),
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
      <Badge variant="info">{account.accTypeName || `Type ${account.accType}`}</Badge>
    {/if}
  </h1>

  {#if loading}
    <SkeletonLoader>
      <div class="space-y-6">
        <div class="skeleton skeleton-card h-64"></div>
        <div class="skeleton skeleton-card h-96"></div>
      </div>
    </SkeletonLoader>
  {:else if error}
    <Card>
      <ErrorCard title="Failed to load account" message={error} onRetry={loadAccount} />
    </Card>
  {:else if account}
    <!-- Account Overview (compact) -->
    <Card>
      <div class="p-4 flex flex-col gap-2">
        <div class="flex items-center gap-3">
          <span class="detail-label">Address:</span>
          <span class="detail-value font-mono break-all">{accountId}</span>
          <button class="copy-btn" aria-label="Copy address" on:click={copyAddress}>
            <CopyIcon copied={copied} size={20} />
          </button>
        </div>
        <!-- Type badge moved to page title -->
        {#if account.balances && account.balances.length > 0}
          <div class="flex items-center gap-3">
            <span class="detail-label">Balance:</span>
            {#each account.balances as bal}
              <span class="detail-value text-sm">{(bal.value / 1e9).toFixed(4)} {bal.name}</span>
            {/each}
          </div>
        {/if}
        <div class="flex items-center gap-3">
          <span class="detail-label">Last Paid:</span>
          <LiveTimestamp timestamp={account.lastPaid.getTime() / 1000} className="time-text" />
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
                      >{trimMiddle(account.codeHash, 66)}</span>
                    <button
                      class="copy-btn small"
                      aria-label="Copy code hash"
                      on:click={() => copyLong(account?.codeHash ?? '')}
                    >
                        <CopyIcon copied={copiedLong === account.codeHash} size={18} small={true} />
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
                      >{trimMiddle(account.dataHash, 66)}</span>
                    <button
                      class="copy-btn small"
                      aria-label="Copy data hash"
                      on:click={() => copyLong(account?.dataHash ?? '')}
                    >
                        <CopyIcon copied={copiedLong === account.dataHash} size={18} small={true} />
                      </button>
                  </div>
                </div>
              {/if}

              {#if account.initCodeHash}
                <div class="long-field">
                  <label class="detail-label" for="account-init-code-hash-preview"
                    >Init Code Hash</label
                  >
                  <div class="long-field-row">
                    <span
                      id="account-init-code-hash-preview"
                      class="long-text"
                      title={account.initCodeHash}
                      >{trimMiddle(account.initCodeHash, 66)}</span>
                    <button
                      class="copy-btn small"
                      aria-label="Copy init code hash"
                      on:click={() => copyLong(account?.initCodeHash ?? '')}
                    >
                        <CopyIcon copied={copiedLong === account.initCodeHash} size={18} small={true} />
                      </button>
                  </div>
                </div>
              {/if}
              {#if account.code}
                <div class="long-field">
                  <label class="detail-label" for="account-code-preview">Code</label>
                  <div class="long-field-row">
                    <span
                      id="account-code-preview"
                      class="long-text"
                      title={account.code}
                      >{trimMiddle(account.code, 66)}</span>
                    <button
                      class="copy-btn small"
                      aria-label="Copy code"
                      on:click={() => copyLong(account?.code ?? '')}
                    >
                        <CopyIcon copied={copiedLong === account.code} size={18} small={true} />
                      </button>
                  </div>
                </div>
              {/if}

            </div>
            <div>
              {#if account.lastTransLt}
                <div class="long-field">
                  <label class="detail-label" for="last-trans-lt">Last Transaction LT</label>
                  <div class="long-field-row">
                    <span id="last-trans-lt" class="long-text" title={String(account.lastTransLt)}>{String(account.lastTransLt)}</span>
                  </div>
                </div>
              {/if}
              {#if account.bits}
                <div class="long-field">
                  <label class="detail-label" for="account-bits">Bits</label>
                  <div class="long-field-row">
                    <span id="account-bits" class="long-text" title={String(account.bits)}>{String(account.bits)}</span>
                  </div>
                </div>
              {/if}
              {#if account.cells}
                <div class="long-field">
                  <label class="detail-label" for="account-cells">Cells</label>
                  <div class="long-field-row">
                    <span id="account-cells" class="long-text" title={String(account.cells)}>{String(account.cells)}</span>
                  </div>
                </div>
              {/if}
              {#if account.publicCells}
                <div class="long-field">
                  <label class="detail-label" for="public-cells">Public Cells</label>
                  <div class="long-field-row">
                    <span id="public-cells" class="long-text" title={String(account.publicCells)}>{String(account.publicCells)}</span>
                  </div>
                </div>
              {/if}

              {#if account.data}
                <div class="long-field">
                  <label class="detail-label" for="account-data-preview">Data</label>
                  <div class="long-field-row">
                    <span
                      id="account-data-preview"
                      class="long-text"
                      title={account.data}
                      >{trimMiddle(account.data, 66)}</span>
                    <button
                      class="copy-btn small"
                      aria-label="Copy data"
                      on:click={() => copyLong(account?.data ?? '')}
                    >
                        <CopyIcon copied={copiedLong === account.data} size={18} small={true} />
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

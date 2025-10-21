<script lang="ts">
  import { translate } from '$lib/stores/i18n';
  $: t = $translate;

  export let title: string = t('error.defaultTitle');
  export let message: string | null = null;
  export let retryLabel: string = t('error.retry');
  export let onRetry: (() => void) | null = null;
</script>

<div class="error-card p-8 text-center">
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
  <h3 class="text-lg font-semibold mb-2">{title}</h3>
  {#if message}
    <p class="text-muted mb-4">{message}</p>
  {/if}
  <button
    class="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
    on:click={() => onRetry && onRetry()}
  >
    {retryLabel}
  </button>
</div>

<style>
  .text-muted {
    color: var(--text-muted);
  }
</style>

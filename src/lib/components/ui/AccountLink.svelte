<script lang="ts">
  import { formatAddress } from '$lib/utils/formatters';
  import { translate } from '$lib/stores/i18n';

  export let address: string;
  export let showFullAddress = false;
  export let className = 'hover:text-primary-600';
  export let title: string | undefined = undefined;

  $: t = $translate;
  // Use provided title or fallback to full address
  $: title = title ?? address;
  $: content = showFullAddress ? address : formatAddress(address);
</script>

{#if address.length === 66}
  <a href="/accounts/{address}" title="{title}" class="{className}">
    {content}
  </a>
{:else}
  <span class="text-gray-500">{t('common.external')}</span>
{/if}

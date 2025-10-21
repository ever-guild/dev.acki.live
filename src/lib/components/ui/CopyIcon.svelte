<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { translate } from '$lib/stores/i18n';

  export let value: string | null = null; // value to copy
  export let size: number = 18;
  export let className = '';
  export let small = false;

  const dispatch = createEventDispatcher();

  let copied = false;
  let copyTimeout: number | null = null;

  function doCopy() {
    if (!value) return;
    // Use navigator.clipboard if available
    navigator.clipboard
      .writeText(value)
      .then(() => {
        copied = true;
        dispatch('copy', { value });
        if (copyTimeout) window.clearTimeout(copyTimeout);
        copyTimeout = window.setTimeout(() => {
          copied = false;
          copyTimeout = null;
        }, 1500);
      })
      .catch((err) => {
        // Still provide feedback by briefly toggling copied to false/true
        console.error('Copy failed', err);
      });
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      doCopy();
    }
  }

  $: t = $translate;
</script>

<span
  style="position:relative;display:inline-flex;align-items:center;"
  role="button"
  tabindex="0"
  on:click={doCopy}
  on:keydown={onKeyDown}
  aria-label="Copy to clipboard"
>
  <svg
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
  class={`copy-icon${copied ? ' copied' : ''} ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M8 7V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-2"
    />
    <rect
      x="3"
      y="7"
      width="13"
      height="13"
      rx="2"
      stroke="currentColor"
      stroke-width="2"
    />
  </svg>
  {#if copied}
    <span class="copied-popover {small ? 'small' : ''}">{t('copy.copied')}</span>
  {/if}
</span>

<style lang="scss">
  .copy-icon {
    color: #6b7280;
    transition: transform 0.2s, color 0.2s;
    display: inline-block;
    vertical-align: middle;
  }
  .copy-icon.copied {
    color: #16a34a;
    transform: scale(1.2) rotate(-15deg);
  }
  .copied-popover {
    position: absolute;
    right: 0;
    top: 110%;
    background: rgba(17, 24, 39, 0.95);
    color: #fff;
    font-size: 0.85rem;
    padding: 0.15rem 0.6rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 14px rgba(2, 6, 23, 0.3);
    white-space: nowrap;
    z-index: 10;
    opacity: 1;
    animation: pop-fade 1.2s linear;
  }
  .copied-popover.small {
    font-size: 0.7rem;
    padding: 0.1rem 0.45rem;
    top: 105%;
  }
</style>

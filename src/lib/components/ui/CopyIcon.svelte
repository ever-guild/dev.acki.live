<script lang="ts">
  export let copied = false;
  export let size: number = 18;
  export let className = '';
  export let small = false;
</script>

<span style="position:relative;display:inline-flex;align-items:center;">
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
    <span class="copied-popover {small ? 'small' : ''}">Copied</span>
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

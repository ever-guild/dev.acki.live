<script lang="ts">
	export let variant: 'success' | 'info' | 'warning' | 'error' = 'info';
</script>

<span 
	class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
	class:success={variant === 'success'} 
	class:info={variant === 'info'} 
	class:warning={variant === 'warning'} 
	class:error={variant === 'error'}
>
	<slot />
</span>

<style>
	.success {
		@apply bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400;
	}

	.info {
		@apply bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400;
	}

	.warning {
		@apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400;
	}

	.error {
		@apply bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400;
	}
</style>

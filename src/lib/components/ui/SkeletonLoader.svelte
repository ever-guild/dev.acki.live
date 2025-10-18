<div class="skeleton-container">
	<slot />
</div>

<style>
	.skeleton-container :global(.skeleton) {
		border-radius: 0.375rem;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
	}

	:global(body.dark) .skeleton-container :global(.skeleton) {
		background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
		background-size: 200% 100%;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	/* Skeleton variants */
	:global(.skeleton-text) {
		height: 1rem;
		width: 100%;
		border-radius: 0.375rem;
	}

	:global(.skeleton-title) {
		height: 1.5rem;
		width: 66%;
		border-radius: 0.375rem;
	}

	:global(.skeleton-circle) {
		border-radius: 9999px;
	}

	:global(.skeleton-rect) {
		border-radius: 0.375rem;
	}
</style>

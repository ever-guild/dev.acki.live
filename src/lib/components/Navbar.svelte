<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { currentLanguage, translate, type Language } from '$lib/stores/i18n';
	import { isDarkMode } from '$lib/stores/theme';
	import { globalSearch, getSearchResultPath } from '$lib/services/search';

	$: currentPath = $page.url.pathname;
	$: t = $translate;

	let searchQuery = '';
	let isSearching = false;
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	function switchLanguage(lang: Language) {
		currentLanguage.setLanguage(lang);
	}

	function toggleTheme() {
		isDarkMode.toggle();
	}

	// Auto-search when query looks complete
	function handleInput() {
		// Clear previous timeout
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		const trimmed = searchQuery.trim();
		
		// Check if query looks like a complete ID
		const isAccountAddress = /^(-1|0):[a-fA-F0-9]{64}$/.test(trimmed);
		const isHash = /^[a-fA-F0-9]{64}$/.test(trimmed);
		
		if (isAccountAddress || isHash) {
			// Auto-search after 500ms of no typing
			searchTimeout = setTimeout(() => {
				handleSearch(new Event('submit'));
			}, 500);
		}
	}

	async function handleSearch(event: Event) {
		event.preventDefault();
		if (!searchQuery.trim() || isSearching) return;

		isSearching = true;
		try {
			const result = await globalSearch(searchQuery);
			if (result.found && result.results.length > 0) {
				// Navigate to the first result
				const path = getSearchResultPath(result.results[0]);
				await goto(path);
				searchQuery = ''; // Clear search after navigation
			} else {
				alert('No results found for: ' + searchQuery);
			}
		} catch (error) {
			console.error('Search error:', error);
			alert('Search failed. Please try again.');
		} finally {
			isSearching = false;
		}
	}
</script>

<nav class="bg-secondary border-b border-custom shadow-lg">
	<div class="container mx-auto px-4">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<div class="flex-shrink-0">
				<a href="/" class="flex items-center">
					{#if $isDarkMode}
						<img src="/AN Logo - horizontal white.svg" alt="Acki Nacki" class="h-8" />
					{:else}
						<img src="/AN Logo - horizontal black.svg" alt="Acki Nacki" class="h-8" />
					{/if}
				</a>
			</div>

			<!-- Global Search Bar -->
			<div class="hidden lg:block flex-1 max-w-md mx-4">
				<form on:submit={handleSearch} class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						on:input={handleInput}
						placeholder="address / msg / tx / block"
						disabled={isSearching}
						class="w-full px-4 py-2 pl-10 pr-10 rounded-lg border transition-all"
						style="background-color: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-color);"
					/>
					<svg
						class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2"
						style="color: var(--text-muted);"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					{#if isSearching}
						<div class="absolute right-3 top-1/2 transform -translate-y-1/2">
							<svg class="animate-spin h-5 w-5 text-primary-600" viewBox="0 0 24 24">
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
									fill="none"
								/>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
						</div>
					{/if}
				</form>
			</div>

			<!-- Navigation Links -->
			<div class="hidden md:flex items-center space-x-1">
				<a href="/blocks" class="nav-link" class:active={currentPath === '/blocks'}>
					{t('nav.blocks')}
				</a>
				<a href="/transactions" class="nav-link" class:active={currentPath === '/transactions'}>
					{t('nav.transactions')}
				</a>
				<a href="/messages" class="nav-link" class:active={currentPath === '/messages'}>
					{t('nav.messages')}
				</a>
				<a href="/contracts" class="nav-link" class:active={currentPath === '/contracts'}>
					{t('nav.contracts')}
				</a>
				<!-- <a href="/stats" class="nav-link" class:active={currentPath === '/stats'}>
					{t('nav.stats')}
				</a>
				<a href="/showcase" class="nav-link" class:active={currentPath === '/showcase'}>
					{t('nav.showcase')}
				</a> -->
			</div>

			<!-- Controls -->
			<div class="flex items-center space-x-4">
				<!-- Language Switcher -->
				<div class="flex items-center space-x-2">
					<button
						on:click={() => switchLanguage('en')}
						class="px-3 py-1 rounded text-sm transition-colors"
						class:bg-primary-600={$currentLanguage === 'en'}
						class:text-white={$currentLanguage === 'en'}
						class:text-secondary={$currentLanguage !== 'en'}
						class:hover:bg-tertiary={$currentLanguage !== 'en'}
					>
						EN
					</button>
					<button
						on:click={() => switchLanguage('ru')}
						class="px-3 py-1 rounded text-sm transition-colors"
						class:bg-primary-600={$currentLanguage === 'ru'}
						class:text-white={$currentLanguage === 'ru'}
						class:text-secondary={$currentLanguage !== 'ru'}
						class:hover:bg-tertiary={$currentLanguage !== 'ru'}
					>
						RU
					</button>
				</div>

				<!-- Theme Toggle -->
				<button
					on:click={toggleTheme}
					class="p-2 rounded-lg hover:bg-tertiary transition-colors text-secondary"
					aria-label="Toggle theme"
				>
					{#if $isDarkMode}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					{:else}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
					{/if}
				</button>
			</div>
		</div>
	</div>
</nav>

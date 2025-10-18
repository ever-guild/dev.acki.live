<script lang="ts">
	import { onMount } from 'svelte';
	import { isDarkMode } from '$lib/stores/theme';
	import Navbar from '$lib/components/Navbar.svelte';
	import '../app.css';

	onMount(() => {
		// Initialize theme
		isDarkMode.subscribe((isDark) => {
			if (isDark) {
				document.body.classList.add('dark');
				document.body.classList.remove('light');
			} else {
				document.body.classList.add('light');
				document.body.classList.remove('dark');
			}
		});
	});
</script>

<div class="min-h-screen bg-primary text-primary">
	<Navbar />
	<main class="container mx-auto px-4 py-8">
		<slot />
	</main>
</div>

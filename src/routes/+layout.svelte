<script lang="ts">
	import { onMount } from 'svelte';
	import { isDarkMode } from '$lib/stores/theme';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
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

<div class="min-h-screen bg-primary text-primary flex flex-col">
	<Navbar />
	<main class="container mx-auto px-4 py-8 flex-1 flex flex-col">
		<div class="flex-1">
			<slot />
		</div>
	</main>
	<Footer />
</div>

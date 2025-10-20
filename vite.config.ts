import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(() => {
	return {
		plugins: [sveltekit()],
    envPrefix: ['ACKI_LIVE_'],
	};
});

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		plugins: [sveltekit()],
		define: {
			__ACKI_FEATURES__: (() => {
				try {
					const featuresArray = JSON.parse(env.ACKI_LIVE_FEATURES || '[]');
					const features: Record<string, boolean> = {};
					featuresArray.forEach((feature: string) => {
						features[feature] = true;
					});
					return JSON.stringify(features);
				} catch {
					return JSON.stringify({});
				}
			})()
		},
	};
});

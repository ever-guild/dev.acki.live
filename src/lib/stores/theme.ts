import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createThemeStore() {
	const { subscribe, set, update } = writable<boolean>(true);

	// Initialize from localStorage
	if (browser) {
		const savedTheme = localStorage.getItem('theme');
		const isDark = savedTheme ? savedTheme === 'dark' : true;
		set(isDark);
		applyTheme(isDark);
	}

	function applyTheme(isDark: boolean) {
		if (browser) {
			if (isDark) {
				document.body.classList.add('dark');
				document.body.classList.remove('light');
			} else {
				document.body.classList.add('light');
				document.body.classList.remove('dark');
			}
		}
	}

	return {
		subscribe,
		toggle: () =>
			update((isDark) => {
				const newValue = !isDark;
				if (browser) {
					localStorage.setItem('theme', newValue ? 'dark' : 'light');
					applyTheme(newValue);
				}
				return newValue;
			}),
		set: (value: boolean) => {
			if (browser) {
				localStorage.setItem('theme', value ? 'dark' : 'light');
				applyTheme(value);
			}
			set(value);
		}
	};
}

export const isDarkMode = createThemeStore();

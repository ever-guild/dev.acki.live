export interface FeatureFlags {
	stat?: boolean;
	showcase?: boolean;
	wasm?: boolean;
}

declare global {
	const __ACKI_FEATURES__: FeatureFlags;
}

export const feature: FeatureFlags = typeof __ACKI_FEATURES__ !== 'undefined' ? __ACKI_FEATURES__ : {};

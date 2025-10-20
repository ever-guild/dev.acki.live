import { dev } from '$app/environment';
const env = (import.meta as any).env;

export const environment = {
	production: !dev,
	develop: dev,
  graphqlEndpoint: env.ACKI_LIVE_GRAPHQL ?? 'https://mainnet.ackinacki.org/graphql'
};

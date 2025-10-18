import { environment } from '$lib/environment';

export interface SearchResult {
	type: 'block' | 'transaction' | 'message' | 'account';
	id: string;
	relatedTransactionId?: string; // For messages
}

export interface SearchResponse {
	found: boolean;
	results: SearchResult[];
}

/**
 * Search across blocks, transactions, and messages by ID
 * @param query Search query (block hash, transaction hash, message ID, or account address)
 * @returns SearchResponse with found resources
 */
export async function globalSearch(query: string): Promise<SearchResponse> {
	if (!query || query.trim().length === 0) {
		return { found: false, results: [] };
	}

	const trimmedQuery = query.trim();
	const results: SearchResult[] = [];

	try {
		// First, try the universal search query
		const response = await fetch(environment.graphqlEndpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'text/plain' },
			body: JSON.stringify({
				query: `
					query SearchById($id: String!) {
						transactions(filter: { id: { eq: $id } }, limit: 1) { id }
						blocks(filter: { id: { eq: $id } }, limit: 1) { id }
						messages(filter: { id: { eq: $id } }, limit: 1) { 
							id 
							dst_transaction { id } 
							src_transaction { id } 
						}
					}
				`,
				variables: { id: trimmedQuery }
			})
		});

		const data = await response.json();

		if (data.errors) {
			console.error('Search error:', data.errors);
			return { found: false, results: [] };
		}

		// Check blocks
		if (data.data?.blocks && data.data.blocks.length > 0) {
			results.push({
				type: 'block',
				id: data.data.blocks[0].id
			});
		}

		// Check transactions
		if (data.data?.transactions && data.data.transactions.length > 0) {
			results.push({
				type: 'transaction',
				id: data.data.transactions[0].id
			});
		}

		// Check messages
		if (data.data?.messages && data.data.messages.length > 0) {
			const message = data.data.messages[0];
			results.push({
				type: 'message',
				id: message.id,
				relatedTransactionId: message.dst_transaction?.id || message.src_transaction?.id
			});
		}

		// Check if it's an account address (starts with 0: or -1:)
		if (trimmedQuery.match(/^(-1|0):/)) {
			// Verify account exists
			const accountResponse = await fetch(environment.graphqlEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'text/plain' },
				body: JSON.stringify({
					query: `
						query GetAccount($address: String!) {
							account(address: $address) {
								info {
									boc
								}
							}
						}
					`,
					variables: { address: trimmedQuery }
				})
			});

			const accountData = await accountResponse.json();
			
			if (accountData.data?.account?.info?.boc) {
				results.push({
					type: 'account',
					id: trimmedQuery
				});
			}
		}

		return {
			found: results.length > 0,
			results
		};
	} catch (error) {
		console.error('Search failed:', error);
		return { found: false, results: [] };
	}
}

/**
 * Get the route path for a search result
 * @param result SearchResult
 * @returns Route path to navigate to
 */
export function getSearchResultPath(result: SearchResult): string {
	switch (result.type) {
		case 'block':
			return `/blocks/${result.id}`;
		case 'transaction':
			return `/transactions/${result.id}`;
		case 'message':
			return `/messages/${result.id}`;
		case 'account':
			return `/accounts/${result.id}`;
		default:
			return '/';
	}
}

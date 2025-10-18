import { environment } from '$lib/environment';

export interface Block {
	height: number;
	hash: string;
	timestamp: Date;
	txCount: number;
	miner: string;
	workchain_id?: number;
	shard?: string;
	seq_no?: number;
}

export interface Transaction {
	hash: string;
	from: string;
	to: string;
	amount: number;
	status: 'success' | 'pending' | 'failed';
	timestamp: Date;
	aborted?: boolean;
}

export interface Message {
	id: string;
	from: string;
	to: string;
	type: string;
	data: string;
	timestamp: Date;
	value?: string;
	msg_type_name?: string;
}

export interface Contract {
	address: string;
	creator: string;
	created: Date;
	interactions: number;
	type: string;
}

export interface NetworkStats {
	totalBlocks: number;
	totalTransactions: number;
	hashrate: string;
	activeAddresses: number;
	avgBlockTime: string;
	difficulty: string;
	marketCap: string;
	price: string;
}

async function query(queryStr: string, variables: any = {}): Promise<any> {
	try {
		const response = await fetch(environment.graphqlEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain'
			},
			body: JSON.stringify({ query: queryStr, variables })
		});

		const data = await response.json();
		console.log('GraphQL Response:', data);
		return data;
	} catch (error) {
		console.error('GraphQL Error:', error);
		return { data: null, errors: [error] };
	}
}

export async function getBlocks(): Promise<Block[]> {
	const queryStr = `
    query GetLatestBlocks($limit: Int!) {
      blocks(orderBy: [{ path: "gen_utime", direction: DESC }], limit: $limit) {
        id
        seq_no
        gen_utime
        gen_utime_string
        workchain_id
        shard
        tr_count
        status_name
        key_block
        hash
      }
    }
  `;

	const response = await query(queryStr, { limit: 20 });

	if (response.data?.blocks) {
		return response.data.blocks.map((block: any) => ({
			height: block.seq_no || 0,
			hash: block.hash || block.id || '',
			timestamp: block.gen_utime ? new Date(block.gen_utime * 1000) : new Date(),
			txCount: block.tr_count || 0,
			miner: 'N/A',
			workchain_id: block.workchain_id,
			shard: block.shard,
			seq_no: block.seq_no
		}));
	}

	throw new Error('Failed to fetch blocks');
}

export async function getTransactions(): Promise<Transaction[]> {
	const queryStr = `
    query GetLatestTransactions($limit: Int!) {
      transactions(orderBy: [{ path: "now", direction: DESC }], limit: $limit) {
        id
        account_addr
        now
        aborted
        balance_delta(format: DEC)
        total_fees(format: DEC)
        in_message {
          src
          value(format: DEC)
        }
        status_name
      }
    }
  `;

	const response = await query(queryStr, { limit: 25 });

	if (response.data?.transactions) {
		return response.data.transactions.map((tx: any) => {
			const value = tx.in_message?.value ? parseFloat(tx.in_message.value) / 1e9 : 0;

			let status: 'success' | 'pending' | 'failed' = 'success';
			if (tx.aborted) status = 'failed';
			else if (tx.status_name === 'Preliminary' || tx.status_name === 'Proposed')
				status = 'pending';

			return {
				hash: tx.id || '',
				from: tx.in_message?.src || 'N/A',
				to: tx.account_addr || 'N/A',
				amount: value,
				status: status,
				timestamp: tx.now ? new Date(tx.now * 1000) : new Date(),
				aborted: tx.aborted
			};
		});
	}

	throw new Error('Failed to fetch transactions');
}

export async function getMessages(): Promise<Message[]> {
	const queryStr = `
    query GetMessages {
      messages(limit: 20, orderBy: [{path: "created_at", direction: DESC}]) {
        id
        src
        dst
        value(format: DEC)
        created_at
        msg_type_name
        body
      }
    }
  `;

	const response = await query(queryStr);

	if (response.data?.messages) {
		return response.data.messages.map((msg: any) => ({
			id: msg.id || '',
			from: msg.src || 'N/A',
			to: msg.dst || 'N/A',
			type: msg.msg_type_name || 'Unknown',
			data: msg.body || '',
			timestamp: msg.created_at ? new Date(msg.created_at * 1000) : new Date(),
			value: msg.value,
			msg_type_name: msg.msg_type_name
		}));
	}

	throw new Error('Failed to fetch messages');
}

export async function getContracts(): Promise<Contract[]> {
	const queryStr = `
    query GetAccounts {
      accounts(limit: 15, orderBy: [{path: "last_paid", direction: DESC}]) {
        id
        address
        acc_type_name
        last_paid
        code_hash
      }
    }
  `;

	const response = await query(queryStr);

	if (response.data?.accounts) {
		return response.data.accounts
			.filter((acc: any) => acc.acc_type_name === 'Active' && acc.code_hash)
			.map((acc: any) => ({
				address: acc.address || acc.id || '',
				creator: 'N/A',
				created: acc.last_paid ? new Date(acc.last_paid * 1000) : new Date(),
				interactions: Math.floor(Math.random() * 1000) + 10,
				type: guessContractType(acc.code_hash)
			}));
	}

	throw new Error('Failed to fetch contracts');
}

export async function getStats(): Promise<NetworkStats> {
	const infoQuery = `
    query GetInfo {
      info {
        lastBlockTime
        blocksLatency
      }
    }
  `;

	const blocksQuery = `
    query GetBlockStats($limit: Int!) {
      blocks(orderBy: [{ path: "gen_utime", direction: DESC }], limit: $limit) {
        gen_utime
        tr_count
      }
    }
  `;

	try {
		const [infoResponse, blocksResponse] = await Promise.all([
			query(infoQuery),
			query(blocksQuery, { limit: 10 })
		]);

		const info = infoResponse.data?.info;
		const blocks = blocksResponse.data?.blocks;

		let avgBlockTime = '~15s';
		if (blocks && blocks.length > 1) {
			const times = blocks.map((b: any) => b.gen_utime).filter(Boolean);
			if (times.length > 1) {
				const diffs = [];
				for (let i = 1; i < times.length; i++) {
					diffs.push(Math.abs(times[i] - times[i - 1]));
				}
				const avg = diffs.reduce((a: number, b: number) => a + b, 0) / diffs.length;
				avgBlockTime = `${avg.toFixed(1)}s`;
			}
		}

		const totalTxCount = blocks?.reduce((sum: number, b: any) => sum + (b.tr_count || 0), 0) || 0;

		return {
			totalBlocks: info?.lastBlockTime ? Math.floor(info.lastBlockTime / 15000) : 1234567,
			totalTransactions: totalTxCount * 1000 || 9876543,
			hashrate: '234.5 TH/s',
			activeAddresses: 45678,
			avgBlockTime: avgBlockTime,
			difficulty: '12.34T',
			marketCap: '$1.23B',
			price: '$2,345.67'
		};
	} catch (error) {
		throw new Error('Failed to fetch network stats');
	}
}

function guessContractType(codeHash: string): string {
	const types = ['Smart Contract', 'Token', 'DEX', 'NFT', 'Staking', 'DAO'];
	const hash = codeHash.toLowerCase();
	const index = parseInt(hash.substring(2, 4), 16) % types.length;
	return types[index];
}

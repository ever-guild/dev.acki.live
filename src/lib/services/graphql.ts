import { environment } from '$lib/environment';

const query = {
  GetInfo: `
    query GetInfo {
      info {
        lastBlockTime
        blocksLatency
      }
    }
  `,
  GetBlockStats: `
    query GetBlockStats($limit: Int!) {
      blocks(orderBy: [{ path: "gen_utime", direction: DESC }], limit: $limit) {
        gen_utime
        tr_count
      }
    }
  `,
  GetAccounts: `
    query GetAccounts {
      accounts(limit: 15, orderBy: [{path: "last_paid", direction: DESC}]) {
        id
        address
        acc_type_name
        last_paid
        code_hash
      }
    }
  `,
  GetMessages: `
    query GetMessages($limit: Int!) {
      messages(limit: $limit, orderBy: [{path: "created_at", direction: DESC}]) {
        id
        src
        dst
        value(format: DEC)
        created_at
        msg_type_name
      }
    }
  `,
  GetTransactionDetails: `
    query GetTransactionDetails($id: String!) {
      transactions(filter: { id: { eq: $id } }) {
        id
        account_addr
        workchain_id
        now
        now_string
        lt
        block_id
        orig_status_name
        end_status_name
        total_fees(format: DEC)
        balance_delta(format: DEC)
        outmsg_cnt
        aborted
        destroyed
        tr_type_name
        in_message { id src dst msg_type_name value(format: DEC) bounce bounced body created_at boc src_transaction {id}}
        out_messages { id src dst msg_type_name value(format: DEC) bounce bounced body created_at boc dst_transaction {id} }
        compute { compute_type_name success exit_code gas_used gas_fees(format: DEC) gas_limit vm_steps }
        action { success valid no_funds result_code tot_actions msgs_created total_fwd_fees(format: DEC) total_action_fees(format: DEC) }
        storage { storage_fees_collected(format: DEC) status_change_name }
      }
    }
  `,
  GetLatestTransactions: `
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
  `,
  GetLatestBlocks: `
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
  `,
  GetAccountBoc: `
    query GetAccount($address: String!) {
        account(address: $address) {
            info {
                boc
            }
        }
    }
  `,
  GetAccountTransactions: `
    query GetAccountTransactions($limit: Int!, $address: String!) {
      transactions(
        orderBy: [{ path: "now", direction: DESC }]
        limit: $limit
        filter: { account_addr: { eq: $address } }
      ) {
        id
        now
        now_string
        lt
        orig_status_name
        end_status_name
        total_fees(format: DEC)
        balance_delta(format: DEC)
        in_msg
        outmsg_cnt
        aborted
        compute {
          success
          exit_code
        }
        destroyed
      }
    }
  `,
}

class GraphQLClient {
  // TODO: Fix data
  async getStats(): Promise<NetworkStats> {
    const [infoResponse, blocksResponse] = await Promise.all([
      this.post(query.GetInfo),
      this.post(query.GetBlockStats, { limit: 10 })
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
  }

  async getContracts(): Promise<Contract[]> {
    const response = await this.post(query.GetAccounts);

    if (response.data?.accounts) {
      return response.data.accounts
        .filter((acc: any) => acc.acc_type_name === 'Active' && acc.code_hash)
        .map((acc: any) => ({
          address: acc.address,// || acc.id || '',
          //creator: 'N/A',
          created: acc.last_paid,// ? new Date(acc.last_paid * 1000) : new Date(),
          //interactions: Math.floor(Math.random() * 1000) + 10,
          //type: guessContractType(acc.code_hash)
        }));
    }

    throw new Error('Failed to fetch contracts');
  }

  async getMessages(limit = 20): Promise<Message[]> {
    const response = await this.post(query.GetMessages, { limit });

    if (response?.messages) {
      return response.messages.map((msg: any) => ({
        id: msg.id,
        from: msg.src,
        to: msg.dst,
        type: msg.msg_type_name,
        data: msg.body,
        timestamp: new Date(msg.created_at * 1000),
        value: msg.value / 1e9,
        msg_type_name: msg.msg_type_name,
      }));
    }

    throw new Error('Failed to fetch messages');
  }

  async getLatestTransactions(limit = 25): Promise<Transaction[]> {
    const response = await this.post(
      query.GetLatestTransactions,
      { limit }
    );

    if (response?.transactions) {
      return response.transactions.map((tx: any) => {
        const value = tx.in_message?.value ? parseFloat(tx.in_message.value) / 1e9 : 0;

        let status: 'success' | 'pending' | 'failed' = 'pending';
        if (tx.aborted) status = 'failed';
        else if (tx.status_name === 'Finalized') status = 'success';

        return {
          hash: tx.id,
          from: tx.in_message?.src,
          to: tx.account_addr,
          amount: value,
          status,
          timestamp: new Date(tx.now * 1000)
        };
      });
    }

    throw new Error('Failed to fetch transactions');
  }

  async getLatestBlocks(limit = 20): Promise<Block[]> {
    const response = await this.post(query.GetLatestBlocks, { limit });

    if (response?.blocks) {
      var result = response.blocks.map((block: any) => ({
        height: block.seq_no || 0,
        hash: block.hash || block.id || '',
        timestamp: new Date(block.gen_utime * 1000),
        txCount: block.tr_count || 0,
        workchain_id: block.workchain_id,
        shard: block.shard,
      }));
      return result;
    }

    throw new Error('Failed to fetch blocks');
  }

  async getAccountBoc(address: string): Promise<any> {
    const response = await this.post(
      query.GetAccountBoc,
      { address }
    );

    if (response.account?.info) {
      return response.account?.info.boc || null;
    }

    throw new Error('Account not found');
  }

  async getAccountTransactions(address: string) {
    const response = await this.post(
      query.GetAccountTransactions,
      { address, limit: 20 }
    );

    if (response.data?.transactions) {
      return response.data.transactions;
    }

    throw new Error('No transactions found');
  }

  private async request(method: string, query: string, variables: Record<string, any>) {
    const response = await fetch(environment.graphqlEndpoint, {
      method,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    const result = await response.json();

    console.log('GraphQL response:', result);

    if (result.errors) {
      console.error('Error loading data:', result.errors);
      return null;
    }

    return result.data;
  }

  private post(query: string, variables: Record<string, any> = {}) {
    return this.request('POST', query, variables);
  }
};

const graphqlClient = new GraphQLClient();

export default graphqlClient;

// TODO: Review
function guessContractType(codeHash: string): string {
  const types = ['Smart Contract', 'Token', 'DEX', 'NFT', 'Staking', 'DAO'];
  const hash = codeHash.toLowerCase();
  const index = parseInt(hash.substring(2, 4), 16) % types.length;
  return types[index];
}

export interface Block {
  height: number;
  hash: string;
  timestamp: Date;
  txCount: number;
  miner: string;
  workchain_id?: number;
  shard?: string;
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

import { environment } from '$lib/environment';

const GetAccountBocQuery = `
  query GetAccount($address: String!) {
      account(address: $address) {
          info {
              boc
          }
      }
  }
`;

const GetAccountTransactions = `
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
`;

async function request(method: string, query: string, variables: Record<string, any>) {
  const response = await fetch(environment.graphqlEndpoint, {
    method,
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error('Error loading data:', result.errors);
    return null;
  }

  return result.data;
}

function post(query: string, variables: Record<string, any>) {
  return request('POST', query, variables);
}

export async function getAccountBoc(address: string): Promise<any> {
  const response = await post(GetAccountBocQuery, { address });

  if (!response.account?.info) {
    throw new Error('Account not found');
  }

  return response.account?.info.boc || null;
}

export async function getAccountTransactions(address: string) {
  const response = await post(GetAccountTransactions, { address, limit: 20 });

  if (!response.data?.transactions) {
    throw new Error('No transactions found');
  }

  return response.data.transactions;
}

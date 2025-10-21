import graphql from '$lib/services/graphql';
import tvmClient, { getAddressByName } from './tvmClient';

export async function getAccountDetails(addressOrName: string): Promise<AccountDetails | null> {
  let address = addressOrName.trim();

  if (!isAddress(address)) {
    address = await getAddressByName(address);
  }

  const accountBoc = await graphql.getAccountBoc(address);
  const { parsed: accountData } = await tvmClient.boc.parse_account({
    boc: accountBoc
  });

  if (!accountData) {
    throw new Error('Failed to parse account BOC');
  }

  var balancesOther = accountData.balance_other
    ?.map((bo: any) => ({
      id: bo.currency,
      name: bo.currency === 1 ? 'NACKL' : '',
      value: parseInt(bo.value, 16),
    })) || [];
  var result = {
    accType: accountData.acc_type,
    accTypeName: accountData.acc_type_name,
    balances: balancesOther
      .concat([
        {
          id: 0,
          name: 'SHELL',
          value: parseInt(accountData.balance, 16),
        },
      ]),
    bits: parseInt(accountData.bits, 16),
    boc: accountBoc,
    cells: parseInt(accountData.cells, 16),
    code: accountData.code,
    codeHash: accountData.code_hash,
    data: accountData.data,
    dataHash: accountData.data_hash,
    id: accountData.id,
    initCodeHash: accountData.init_code_hash,
    jsonVersion: accountData.json_version,
    lastPaid: new Date(accountData.last_paid * 1000),
    lastTransLt: parseInt(accountData.last_trans_lt, 16),
    publicCells: parseInt(accountData.public_cells, 16),
    workchainId: accountData.workchain_id,
  };

  return result;
}

export function isAddress(input: string): boolean {
  const trimmed = input.trim();
  const regex = /^(0:|-1:)[0-9a-fA-F]{64}$/;
  return regex.test(trimmed);
}

export function isHash(input: string): boolean {
  const trimmed = input.trim();
  const regex = /^[0-9a-fA-F]{64}$/;
  return regex.test(trimmed);
}

export interface AccountDetails {
  accType: number;
  accTypeName: string;
  balances: Balance[];
  bits: number;
  boc: string;
  cells: number;
  code: string;
  codeHash: string;
  data: string;
  dataHash: string;
  id: string;
  initCodeHash: string;
  jsonVersion: number;
  lastPaid: Date;
  lastTransLt: number;
  publicCells: number;
  workchainId: number;
}

export interface Balance {
  id: number;
  name: string;
  value: number;
}

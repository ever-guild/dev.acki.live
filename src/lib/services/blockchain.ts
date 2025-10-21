import graphql from '$lib/services/graphql';
import tvmClient, { getIndexerAddressByName, popitGameCode } from './tvmClient';
import indexerAbi from '/src/data/contracts/mvsystem/Indexer.abi.json?raw';
import popitGameAbi from '/src/data/contracts/mvsystem/PopitGame.abi.json?raw';
import MvMultifactorAbi from '/src/data/contracts/mvsystem/MvMultifactor.abi.json?raw';

export enum AccountType {
  Indexer = 'Indexer',
  MvMultifactor = 'Mobile Verifier Multitactor',
  PopitGame = 'Popit Game'
}

export const knownContracts = new Map<string, AccountType>([
  ['6cc8128da9cda444e4ad83fc7064ea51c6a0bbf0e2aa4777d0807e8ed7283cdb', AccountType.MvMultifactor],
  ['18e57fc187e8ac1cc2a9b1e8907e291cd925c840c1f93d2f30fe12747dd90126', AccountType.PopitGame],
  ['f5580a523a708377e8fadc17265def99bed081988d9b9f37e153b938390e3245', AccountType.Indexer]
]);

export async function getAccountDetails(addressOrName: string): Promise<AccountDetails | null> {
  let address = addressOrName.trim();

  if (!isAddress(address)) {
    address = await getIndexerAddressByName(address);
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

  return new AccountDetails(result as any);
}

export async function getMvAddress(addressOrName: string): Promise<string> {
  let address = addressOrName.trim();

  if (!isAddress(address)) {
    address = await getIndexerAddressByName(address);
  }

  const accountBoc = await graphql.getAccountBoc(address);
  const { parsed: account } = await tvmClient.boc.parse_account({
    boc: accountBoc
  });

  return getMvFromIndexerData(account.data);
}

export async function getMvFromIndexerData(indexerData: string): Promise<string> {
  const accountData = await tvmClient.abi.decode_account_data({
    abi: {
      type: 'Json',
      value: indexerAbi
    },
    data: indexerData
  });

  return accountData.data._wallet
}

export async function getPopitGameAddress(addressOrName: string): Promise<string> {
  let address = addressOrName.trim();

  if (!isAddress(address)) {
    address = await getMvAddress(address);
  }

  const encodedMessage = await tvmClient.abi.encode_message({
    abi: {
      type: 'Json',
      value: popitGameAbi
    },
    deploy_set: {
      code: popitGameCode,
      initial_data: {
        _pubkey: '0x0',
        _owner: address
      }
    },
    signer: {
      type: 'None',
    }
  });

  return encodedMessage.address;
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

export class AccountDetails {
  accType!: number;
  accTypeName!: string;
  balances!: Balance[];
  bits!: number;
  boc!: string;
  cells!: number;
  code!: string;
  codeHash!: string;
  data!: string;
  dataHash!: string;
  id!: string;
  initCodeHash!: string;
  jsonVersion!: number;
  lastPaid!: Date;
  lastTransLt!: number;
  publicCells!: number;
  workchainId!: number;

  constructor(data: AccountDetails) {
    Object.assign(this, data);
  }

  // Lazy cached name and in-flight promise to avoid duplicate fetches
  private _nameCache?: string | null;
  private _namePromise?: Promise<string | null>;

  public get type(): AccountType | null {
    return knownContracts.has(this.codeHash)
      ? knownContracts.get(this.codeHash) || null
      : null;
  }

  public async getName(): Promise<string | null> {
    // return cached value if available
    if (typeof this._nameCache !== 'undefined') return this._nameCache;

    // if a fetch is already in progress, reuse the promise
    if (this._namePromise) return this._namePromise;

    // otherwise, start the fetch and cache the promise
    this._namePromise = (async () => {
      try {
        if (this.type === AccountType.MvMultifactor) {
          const accountData = await tvmClient.abi.decode_account_data({
            abi: {
              type: 'Json',
              value: MvMultifactorAbi
            },
            data: this.data
          });

          this._nameCache = accountData.data._name || null;
        } else if (this.type === AccountType.Indexer) {
          const accountData = await tvmClient.abi.decode_account_data({
            abi: {
              type: 'Json',
              value: indexerAbi
            },
            data: this.data
          });

          this._nameCache = accountData.data._name || null;
        } else {
          this._nameCache = null;
        }
      } catch (err) {
        // In case of error, cache null to avoid repeated failing calls
        this._nameCache = null;
      } finally {
        // clear the in-flight promise after resolution
        this._namePromise = undefined;
      }

      // ensure the returned value is explicitly string|null
      return this._nameCache as string | null;
    })();

    return this._namePromise;
  }

  public async getLinkedAccounts(): Promise<Map<AccountType, string>> {
    const result = new Map<AccountType, string>();
    
    if (this.type === AccountType.MvMultifactor) {
      const name = await this.getName();

      if (name) {
        result.set(AccountType.Indexer, await getIndexerAddressByName(name));
      }

      const popitGameAddress = await getPopitGameAddress(this.id);

      if (popitGameAddress) {
        result.set(AccountType.PopitGame, popitGameAddress);
      }

      return result;
    } else if (this.type === AccountType.Indexer) {
      const mvWallet = await getMvFromIndexerData(this.data);

      if (mvWallet) {
        result.set(AccountType.MvMultifactor, mvWallet);

        const popitGameAddress = await getPopitGameAddress(mvWallet);

        if (popitGameAddress) {
          result.set(AccountType.PopitGame, popitGameAddress);
        }
      }
    } else if (this.type === AccountType.PopitGame) {
      const accountData = await tvmClient.abi.decode_account_data({
        abi: {
          type: 'Json',
          value: popitGameAbi
        },
        data: this.data
      });
      
      const ownerMv = accountData.data._owner;

      if (ownerMv) {
        result.set(AccountType.MvMultifactor, ownerMv);
      }
    }

    return result;
  }
}

export interface Balance {
  id: number;
  name: string;
  value: number;
}

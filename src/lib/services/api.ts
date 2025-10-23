import type { Abi, AbiContract } from "@tvmsdk/core";
import { abiContract } from "@tvmsdk/core";
import tvmClient from "$lib/services/tvmClient";
import { log } from "$lib/utils/log";

export interface CodeInfo {
  name: string;
  abi: Abi;
}

const lastCode = new Map<string, string>([]);

const alias = new Map<string, string>([
  ['f5580a523a708377e8fadc17265def99bed081988d9b9f37e153b938390e3245', 'Indexer'],
  ['6cc8128da9cda444e4ad83fc7064ea51c6a0bbf0e2aa4777d0807e8ed7283cdb', 'Mvmultifactor'],
  ['18e57fc187e8ac1cc2a9b1e8907e291cd925c840c1f93d2f30fe12747dd90126', 'PopitGame'],
  ['18365592c5f1e7d319cc1a2fd58fa05ca3afbe4ac49e73bc765d139a2e2d7a29', 'PopCoinWallet'],
  ['6ec7bbad5c62158a8ada989d93e0212bd0f718e65b88fc85e711a8a22d59f694', 'AckiNackiBlockKeeperNodeWallet'],
  ['5abf243805c7dc9bdbaaca8ea201773c62f8a83177397e191979551dc5544882', 'Boost'],
  ['d732aaab198ae70b0f285d28a6629e141a61c752faaf7395d34b7cf32aa84f6d', 'PopCoinRoot'],
]);

const cashCodeSchema = new Map<string, CodeInfo|undefined>([]);

export async function updateLastCodeHash(): Promise<void> {
  if (lastCode.size > 0) {
    return 
  }
  const response = await fetch('/abi/last', {
    method: 'GET',
  });
  if (response.ok) {
    const list: [string, string][] = await response.json();
    for (const item of list) lastCode.set(item[0], item[1]);
  }
}

export async function getAlias(codeHash: string): Promise<string> {
  await updateLastCodeHash();
  const contractName = alias.get(codeHash);
  if (!contractName) {
    return codeHash;
  }
  const find = lastCode.get(contractName);
  if (!find) {
    return codeHash;
  }
  return find;
}

export async function getCodeSchema(codeHash: string): Promise<CodeInfo|undefined> {
  codeHash = await getAlias(codeHash);
  try {
    if (cashCodeSchema.has(codeHash)) {
      log(`getCodeSchema cashed ${codeHash}`);
      return cashCodeSchema.get(codeHash);
    }
    const response = await fetch(`/abi/${codeHash}`, {
      method: 'GET',
    });
    if (!response.ok) {
      log(`getCodeSchema error fetch ${codeHash}`);
      return undefined;
    }
    const result = await response.json();
    if (!result.abi) {
      log(`getCodeSchema error data ${codeHash}`, { result });
      return undefined;
    }
    const data = {
      name: result.name,
      abi: abiContract(result.abi as AbiContract),
    };
    log(`getCodeSchema saved ${codeHash}`, { data });
    cashCodeSchema.set(codeHash, data);
    return data;
  } catch {
    log(`getCodeSchema catch ${codeHash}`);
    return undefined;
  }
}

export async function decodeData(data: string, abi: Abi) {
  try {
    return (await tvmClient.abi.decode_account_data({
      data,
      abi,
      allow_partial: true,
    })).data;
  } catch(e) {
    log(`decodeData error data ${e}`);
  }
  return undefined;
}

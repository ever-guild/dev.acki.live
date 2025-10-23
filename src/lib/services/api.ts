import type { Abi, AbiContract } from "@tvmsdk/core";
import { abiContract } from "@tvmsdk/core";
import tvmClient from "$lib/services/tvmClient";
import { log } from "$lib/utils/log";

export interface CodeInfo {
  name: string;
  abi: Abi;
}

const cashCodeSchema = new Map<string, CodeInfo|undefined>([]);

export async function getCodeSchema(codeHash: string): Promise<CodeInfo|undefined> {
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

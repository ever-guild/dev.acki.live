import {getNameAddress} from "$lib/utils/addressBook";

export function formatHash(hash: string): string {
  return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
}

export function formatAddress(address: string): string {
  const name = getNameAddress(address);
  if (name) return name;
  return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
}

export function formatBalance(balance?: string): string {
  if (!balance || balance === '0') return '0';
  const num = parseFloat(balance) / 1e9;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(4);
}

export function formatHash(hash: string): string {
  return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
}

export function formatAddress(address: string): string {
  return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
}

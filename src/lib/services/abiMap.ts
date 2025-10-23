const lastCode = new Map<string, string>([
  ['Indexer', 'dd852fea6644e7c4c7aafd9d54f4642a061939759f0904a828a65a42c27c0ce2'],
  ['PopitGame', '68e14a02299e5d18e69746832f372a49ceb395548dd4593c3ccbff19be3c245b'],
  ['Mvmultifactor', '61f0184a271319f684716c483c945eef760f56e2bd0970be384f4084a019fe51'],
]);

const alias = new Map<string, string>([
  ['f5580a523a708377e8fadc17265def99bed081988d9b9f37e153b938390e3245', 'Indexer'],
  ['6cc8128da9cda444e4ad83fc7064ea51c6a0bbf0e2aa4777d0807e8ed7283cdb', 'Mvmultifactor'],
  ['18e57fc187e8ac1cc2a9b1e8907e291cd925c840c1f93d2f30fe12747dd90126', 'PopitGame'],
]);

export function getAlias(codeHash: string): string {
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

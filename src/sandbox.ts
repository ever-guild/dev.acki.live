import { TvmClient } from "@tvmsdk/core";
// npm i -D https://bafybeibmyfx4vbbvjvydk4w52gb6dp4qc3722ojhqogvoetr5nvpw5z2ou.ipfs.w3s.link
import { libNode } from "@tvmsdk/lib-node";
TvmClient.useBinaryLibrary(libNode);
const client = new TvmClient({
  network: {
    endpoints: ['https://shellnet.ackinacki.org']
  },
});

function generateKeys() {
  return client.crypto.generate_random_sign_keys_sync();
}

function print(data: any) {
  console.log(JSON.stringify(data, null, 2));
}

async function main() {
  print(await generateKeys());
}

main().catch(console.error);

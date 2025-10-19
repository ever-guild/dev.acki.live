import { feature } from "$lib/types/features";
import {BinaryLibrary} from "@tvmsdk/core/dist/bin";
import { TvmClient } from "@tvmsdk/core";
import { libWeb, libWebSetup } from"./tvm_lib.js";

if (feature.wasm) {
	(async () => {
		libWebSetup({
			binaryURL: '/tvmsdk.wasm',
		});
		TvmClient.useBinaryLibrary(libWeb as () => Promise<BinaryLibrary>);

		const client = new TvmClient();
		const keys = await client.crypto.generate_random_sign_keys();
		console.log('TVM Client configured with libWeb', { keys });
	})();
}

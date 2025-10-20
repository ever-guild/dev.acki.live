import { TvmClient } from "@tvmsdk/core";
import { libWeb, libWebSetup } from './tvm_lib';

libWebSetup({
    binaryURL: '/tvmsdk.wasm',
    disableSeparateWorker: false,
    debugLog: (msg: any) => console.log('[TVM SDK]', msg)
});

// TODO: load asynchronously
TvmClient.useBinaryLibrary(libWeb);

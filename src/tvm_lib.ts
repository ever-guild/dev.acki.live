/*
 * Copyright 2018-2020 TON Labs LTD.
 *
 * Licensed under the SOFTWARE EVALUATION License (the "License"); you may not use
 * this file except in compliance with the License.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific TON DEV software governing permissions and
 * limitations under the License.
 *
 */

// This file is just a template that used to generate index.js at npm installation stage

import workerScript from './worker?raw';

let options = null;

export function libWebSetup(libOptions) {
    options = libOptions;
}

function getLibName() {
    return Promise.resolve("web");
}

function debugLog(message) {
    if (options && options.debugLog) {
        options.debugLog(message);
    }
}


async function loadModule() {
    const startLoadTime = Date.now();
    let wasmModule;
    if (options && options.loadModule) {
        wasmModule = await options.loadModule;
    } else {
        const fetched = fetch((options && options.binaryURL) || "/eversdk.wasm");
        if (WebAssembly.compileStreaming) {
            debugLog("compileStreaming binary");
            return await WebAssembly.compileStreaming(fetched);
        }
        debugLog("compile binary");
        wasmModule = await WebAssembly.compile(await (await fetched).arrayBuffer());
    }
    await init(wasmModule);
    debugLog(`compile time ${Date.now() - startLoadTime}`);
}

function withSeparateWorker() {
    function debugLog(message) {
        if (options && options.debugLog) {
            options.debugLog(message);
        }
    }

    const workerBlob = new Blob(
        [workerScript],
        { type: "application/javascript" },
    );
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);


    let nextCreateContextRequestId = 1;
    const createContextRequests = new Map();
    let initComplete = false;

    let responseHandler = null;

    worker.onmessage = (evt) => {
        const message = evt.data;
        switch (message.type) {
        case "init":
            initComplete = true;
            for (const [requestId, request] of createContextRequests.entries()) {
                worker.postMessage({
                    type: "createContext",
                    requestId,
                    configJson: request.configJson,
                });
            }
            break;
        case "createContext":
            const request = createContextRequests.get(message.requestId);
            if (request) {
                createContextRequests.delete(message.requestId);
                request.resolve(message.result);
            }
            break;
        case "destroyContext":
            break;
        case "response":
            if (responseHandler) {
                responseHandler(
                    message.requestId,
                    message.params,
                    message.responseType,
                    message.finished,
                );
            }
            break;
        }
    };

    worker.onerror = (evt) => {
        console.log(`Error from Web Worker: ${evt.message}`);
    };

    (async () => {
        worker.postMessage({
            type: "init",
            wasmModule: await loadModule(),
        });
    })();

    return Promise.resolve({
        getLibName,
        setResponseParamsHandler: (handler) => {
            responseHandler = handler;
        },
        createContext: (configJson) => {
            return new Promise((resolve) => {
                const requestId = nextCreateContextRequestId;
                nextCreateContextRequestId += 1;
                createContextRequests.set(requestId, {
                    configJson,
                    resolve,
                });
                if (initComplete) {
                    worker.postMessage({
                        type: "createContext",
                        requestId,
                        configJson,
                    });
                }
            });
        },
        destroyContext: (context) => {
            worker.postMessage({
                type: "destroyContext",
                context,
            });
        },
        sendRequestParams: (context, requestId, functionName, functionParams) => {
            worker.postMessage({
                type: "request",
                context,
                requestId,
                functionName,
                functionParams,
            });
        },
    });
}

export function libWeb() {
    return withSeparateWorker();
}

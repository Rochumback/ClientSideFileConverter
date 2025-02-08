import * as wasm from "./pkg/image_wasm.js";
import init from "./pkg/image_wasm.js";

init()
/**
    * @param {{ data: { bytes: Uint8Array, newFormat:string, filename:string } }
    * */
function convertImage({ data: { bytes, newFormat, filename } }) {
    const image = wasm[newFormat](bytes)
    const imageExtension = newFormat.split("_").pop();
    const blob = new Blob([image], { type: `image/${imageExtension}` });
    const imageURL = URL.createObjectURL(blob);
    postMessage({ imageURL: imageURL, filename: filename })
}
self.onmessage = convertImage

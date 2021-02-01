import { MD5, HmacSHA256, enc, lib } from 'crypto-js';

export function md5hex(body: string | ArrayBuffer): string {
    const ret = body instanceof ArrayBuffer ? MD5(lib.WordArray.create(body)) : MD5(body);
    return enc.Hex.parse(ret.ciphertext);
}

export function hmacSHA256(body: string | ArrayBuffer, key: string | ArrayBuffer): string {
    const keyS = key instanceof ArrayBuffer ? lib.WordArray.create(key) : key;
    const ret = body instanceof ArrayBuffer ? HmacSHA256(lib.WordArray.create(body), keyS) : HmacSHA256(body, keyS);
    return enc.Hex.parse(ret.ciphertext);
}

// export function md5(body: string | ArrayBuffer, target?: ArrayBuffer, byteOffset?: number): ArrayBuffer | void {
//     const ret = body instanceof ArrayBuffer ? MD5(lib.WordArray.create(body)) : MD5(body);
//     if (target) {

//     } else {
//         return ret.ciphertext;
//     }
// }
import { AES, enc, lib } from 'crypto-js';

/**
 * 
 * @param body 
 * @param key 
 * @param iv 
 * @todo 支持arraybuffer作为key/iv
 */
export function aesEncrypt(body: string, key: string | ArrayBuffer, iv: string) {
    const keyS = key instanceof ArrayBuffer ? lib.WordArray.create(key) : key;
    return enc.Base64.parse(AES.encrypt(body, <string>keyS, {
        iv: iv
    }).ciphertext);
}
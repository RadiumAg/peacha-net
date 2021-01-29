import { FileReferences } from './FileReferences';

function s2a(str: string): ArrayBuffer {
	const length = str.length;
	const buff = new ArrayBuffer(length);
	const arr = new Uint8Array(buff);
	let i: number;

	for (i = 0; i < length; i += 1) {
		arr[i] = str.charCodeAt(i);
	}

	return buff;
}

async function d(a, b): Promise<ArrayBuffer> {
	const w = window;
	const m = 'crypto';
	const e = 'encrypt';
	const de = 'decrypt';
	const aes = 'AES-CBC';
	const key = await w[m].subtle.importKey('raw', s2a(atob('VW1wd25XeEh4N1pTU21HdA==')), aes, true, [e, de]);
	return await w[m].subtle[de]({ name: aes, iv: b }, key, a);
}

export async function loadOpalFileFromBuffer(
	buffer: ArrayBuffer
): Promise<{
	sign: string;
	version: number;
	guid: ArrayBuffer;
	fileReferences: FileReferences;
}> {
	const sign = a2s(buffer.slice(0, 4));
	const version = new Int32Array(buffer.slice(4, 8))[0];
	const guid = buffer.slice(8, 24);
	const fileReferences = new FileReferences(await d(buffer.slice(24), guid));
	return {
		sign,
		version,
		guid,
		fileReferences,
	};
}

function a2s(buffer: ArrayBuffer): string {
	const utf8decoder = new TextDecoder();
	return utf8decoder.decode(buffer);
}

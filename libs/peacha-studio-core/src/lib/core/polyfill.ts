import { AbortedError } from './engine/utils/promise';

declare global {
	interface AbortController {
		insure<T>(p: Promise<T>): Promise<T>;
	}
}

AbortController.prototype.insure = function <T>(p: Promise<T>): Promise<T> {
	return new Promise((res: (a: T) => void, rej) => {
		const listener = () => {
			rej(new AbortedError());
		};
		(this as AbortController).signal.addEventListener('abort', listener);
		p.then(d => {
			res(d);
		});
	});
};

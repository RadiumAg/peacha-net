import { AbortedError } from './lib/core/engine/utils/promise';

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

export * from './lib/peacha-studio-core.module';
export * from './lib/core/devkit/zip';
export * from './lib/components/live2d-preview/live2d-preview.component';
export * from './lib/core/vfs';
export * from './lib/live2d-transform-data';

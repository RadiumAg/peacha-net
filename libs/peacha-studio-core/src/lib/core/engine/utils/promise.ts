export class Semaphore {
	private currentSize: number;
	private readonly waitQueue: PromiseHandler<void>[];

	constructor(private room: number = 1, initialSize = 0) {
		this.waitQueue = [];
		this.currentSize = initialSize;
	}

	waitone(): Promise<void> {
		if (this.currentSize < this.room) {
			this.currentSize++;
			return Promise.resolve();
		}
		const handler = new PromiseHandler<void>();
		this.waitQueue.push(handler);
		return handler.promise;
	}

	release(): void {
		this.currentSize--;
		while (this.currentSize < this.room && this.waitQueue.length > 0) {
			const handler = this.waitQueue.shift();
			handler.resolve();
			this.currentSize++;
		}
	}
}

export class PromiseHandler<T> {
	resolve: (exe: T) => void;
	reject: (err?: any) => void;

	readonly promise: Promise<T>;

	constructor() {
		this.promise = new Promise((res, rej) => {
			this.resolve = res;
			this.reject = rej;
		});
	}
}

export class AbortedError extends Error {
	constructor() {
		super('Aborted');
	}
}

export function nextFrame(): Promise<any> {
	return new Promise(res => {
		requestAnimationFrame(res);
	});
}

export function timeout(time: number, singal?: AbortSignal): Promise<void> {
	return new Promise((res, rej) => {
		const listener = singal
			? () => {
					clearTimeout(handler);
					rej(new Error('Aborted.'));
			  }
			: undefined;
		const handler = setTimeout(
			() => {
				res();
				singal?.removeEventListener('abort', listener);
			},
			time,
			singal?.addEventListener('abort', listener)
		);
	});
}

import { createRpcPort, RemoteDelegate, RpcPort } from './rpc_invoker';

export function createWorkerRpc<T>(worker: Worker): RpcPort<T> {
	const delegate = new WorkerRemoteDelegate(worker);
	return createRpcPort<T>(delegate);
}

class ExecutorRef<T> {
	constructor(public resolve: (value?: T | PromiseLike<T>) => void, public reject: (reason?: any) => void) {}
}

class WorkerRemoteDelegate implements RemoteDelegate {
	private innerCounter = 0;
	private rpcMap: Map<number, ExecutorRef<unknown>> = new Map();

	constructor(private worker: Worker) {
		worker.onmessage = ev => {
			const symbol: number = ev.data.token;
			if (this.rpcMap.has(symbol)) {
				if (ev.data.error) {
					this.rpcMap.get(symbol).reject(ev.data.error);
				} else {
					this.rpcMap.get(symbol).resolve(ev.data.data);
				}
				this.rpcMap.delete(symbol);
			}
		};
	}

	invoke(action: string, argg: any): Promise<any> {
		const actionSymbol = this.innerCounter;
		this.innerCounter++;
		const arr = [...argg];
		const transferable = arr[arr.length - 1];
		if (transferable instanceof Array) {
			this.worker.postMessage(
				{
					action,
					token: actionSymbol,
					args: arr.slice(0, arr.length - 1),
				},
				transferable
			);
		} else {
			this.worker.postMessage(
				{
					action,
					token: actionSymbol,
					args: arr,
				},
				[]
			);
		}
		const promise = new Promise((resolve, reject) => {
			this.rpcMap.set(actionSymbol, new ExecutorRef(resolve, reject));
		});
		return promise;
	}

	terminate(): void {
		this.worker.terminate();
	}
}

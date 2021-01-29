import { RpcInstance } from './rpc_instance';

export class WorkerInstance extends RpcInstance {
	constructor() {
		super();
		if ((self as any).document != undefined) {
			return;
		}
		self.addEventListener('message', (e: MessageEvent) => {
			const c: {
				action: string;
				token: number;
				args: any;
			} = e.data;
			if (this.actionMap.has(c.action)) {
				let ret: Promise<unknown> | unknown;
				try {
					ret = this.actionMap.get(c.action).apply(this, c.args);
				} catch (e) {
					(self as any).postMessage({
						token: c.token,
						error: e,
					});
				}
				if (ret instanceof Promise) {
					ret.then(
						s => {
							this._finish(c.action, c.token, s);
						},
						error => {
							(self as any).postMessage({
								token: c.token,
								error,
							});
						}
					);
				} else {
					this._finish(c.action, c.token, ret);
				}
			} else {
				(self as any).postMessage({
					token: c.token,
					error: new Error(`Function ${c.action} is not found.`),
				});
			}
		});
	}

	_finish(action: string, token: any, r: any): void {
		if (this.transferableList.has(action)) {
			(self as any).postMessage(
				{
					token,
					data: r,
				},
				[r]
			);
		} else {
			(self as any).postMessage(
				{
					token,
					data: r,
				},
				[]
			);
		}
	}
}

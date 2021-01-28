import { createWorkerRpc } from '../rpc';
import { RpcPort } from '../rpc/rpc_invoker';
import { BRFRemoteDelegate, BRFRemoteInstance } from './brf.instance';

export function createBRF5(options: {

}): RpcPort<BRFRemoteDelegate> {
  const d = typeof Worker != 'undefined' ?
    createWorkerRpc<BRFRemoteDelegate>(new Worker('./brf.instance.ts', { name: 'tracker', type: 'module' })) : new (class {
      instance = new BRFRemoteInstance() as BRFRemoteDelegate;
      terminate(): void {
        this.instance.release();
      }
    })();
  return d;
}

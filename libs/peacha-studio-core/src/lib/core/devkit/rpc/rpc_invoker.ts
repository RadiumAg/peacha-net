
export function createRpcPort<T>(delegate: RemoteDelegate): RpcPort<T> {
  const ref = new Proxy({}, {
    get(target, prop: string, rec): () => Promise<any> {
      return function(): Promise<unknown>{
          return delegate.invoke(prop, arguments);
      };
    },
    set(target, p, v, r): never {
      throw new Error('NOT SUPPORTED');
    }
  });

  return {
    instance: ref as any,
    terminate: () => {
      delegate.terminate();
    }
  };
}

export type RpcPort<T> = {
  readonly instance: T;
  readonly terminate: () => void;
};

export interface RemoteDelegate {
  invoke(action: string, ...args: any[]): Promise<unknown>;
  terminate(): void;
}

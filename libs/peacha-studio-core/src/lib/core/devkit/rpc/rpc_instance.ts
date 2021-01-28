export class RpcInstance {
  protected actionMap: Map<string, Function>;
  protected transferableList: Set<string>;

  _registerAction(key: string, descriptor: PropertyDescriptor, returnTransferable: boolean): void {
    if (!this.actionMap) {
      this.actionMap = new Map();
      this.transferableList = new Set();
    }
    this.actionMap.set(key, this[key]);
    if (returnTransferable) {
      this.transferableList.add(key);
    }
  }
}

export function Host(): (constructor: {
  new();
}) => void {
  return (constructor: { new() }) => {
    const worker = new constructor();
  };
}

export function RpcAction(returnTransferable: boolean = false): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    target._registerAction(propertyKey, descriptor, returnTransferable);
  };
}

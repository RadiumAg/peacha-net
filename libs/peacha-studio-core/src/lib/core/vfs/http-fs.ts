import { ReadableVirtualFileSystem } from './fs';
import { loadByte } from './http-utils';
import { FileNotFoundError } from './error';


export class HttpVirtualFileSystem implements ReadableVirtualFileSystem {

  private readonly _basePath: string;

  public constructor(private modelJsonPath: string) {
    this._basePath = modelJsonPath.substring(0, modelJsonPath.lastIndexOf('/') + 1);
  }

  public async read(path: string): Promise<ArrayBuffer> {
    try {
      return await loadByte(this._basePath + path);
    }
    catch (e) {
      throw new FileNotFoundError(`[HttpVFS]${path} is not found.`);
    }
  }

  public async tryFindAndRead(fn: any): Promise<ArrayBuffer> {
    if (fn(this.modelJsonPath)) {
      return await loadByte(this.modelJsonPath);
    }
    throw new Error('unknown file');
  }
}

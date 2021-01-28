import { ReadableVirtualFileSystem } from '../../vfs';
import { ZipArchiveRef } from './zip';

export class ZipVFS implements ReadableVirtualFileSystem {
  public constructor(private zip: ZipArchiveRef) {}
  tryFindAndReadAll(
    selector: (path: string) => boolean
  ): [string, Promise<ArrayBuffer>][] {
    const d = this.zip.filter((v) => {
      return selector(v.name);
    });
    return d.map((f) => [f.name, this.zip.file(f.name)]);
  }

  public read(path: string): Promise<ArrayBuffer> {
    return this.zip.file(path);
  }

  public async tryFindAndRead(
    selector: (f: string) => boolean
  ): Promise<ArrayBuffer> {
    const d = this.zip.filter((v) => {
      return selector(v.name);
    });
    if (d.length !== 1) {
      throw new Error('unknown file');
    }
    return this.zip.file(d[0].name);
  }

  public async release(): Promise<void> {
    await this.zip.dispose();
  }
}

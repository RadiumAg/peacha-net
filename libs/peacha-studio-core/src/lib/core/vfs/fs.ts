type SelectorFn = (path: string) => boolean;

export interface ReadableVirtualFileSystem {
	tryFindAndRead(fn: SelectorFn): Promise<ArrayBuffer>;
	tryFindAndReadAll?(fn: SelectorFn): [string, Promise<ArrayBuffer>][];

	read(path: string): Promise<ArrayBuffer>;
}

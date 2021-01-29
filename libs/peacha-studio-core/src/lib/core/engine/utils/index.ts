export function getWebGLContext(canvas: HTMLCanvasElement): WebGLRenderingContext {
	const mms = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
	for (const n of mms) {
		try {
			const ctx = canvas.getContext(n, { premultipliedAlpha: true, preserveDrawingBuffer: true }) as WebGLRenderingContext;
			if (ctx) {
				return ctx;
			}
		} catch (e) {}
	}
	return null;
}

export { Semaphore, PromiseHandler, nextFrame, timeout } from './promise';

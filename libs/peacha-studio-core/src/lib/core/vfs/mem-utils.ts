export async function loadImageFromArrayBuffer(buffer: ArrayBuffer, signal?: AbortSignal): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		const handler = () => {
			image.src = '';
			reject(new Error('Aborted'));
		};
		signal?.addEventListener('abort', handler);
		image.crossOrigin = 'true';
		const blob = new Blob([buffer]);
		const objectUrl = window.URL.createObjectURL(blob);
		image.src = objectUrl;
		image.onload = () => {
			resolve(image);
			signal?.removeEventListener('abort', handler);
			window.URL.revokeObjectURL(objectUrl);
		};
		image.onerror = e => {
			reject(e);
			signal?.removeEventListener('abort', handler);
			window.URL.revokeObjectURL(objectUrl);
		};
	});
}

export function readStringToEnd(buffer: ArrayBuffer): string {
	return new TextDecoder().decode(buffer);
}

export async function scaleImage(image: HTMLImageElement, scale: number): Promise<HTMLCanvasElement> {
	const canvas = document.createElement('canvas');
	canvas.width = image.width * scale;
	canvas.height = image.height * scale;
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
	return canvas;
}

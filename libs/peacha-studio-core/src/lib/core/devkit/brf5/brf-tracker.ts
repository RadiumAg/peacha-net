import { PlatformFaceTracker } from '../../engine';
import { WebCamSource } from './image-source';
import { RpcPort } from '../rpc/rpc_invoker';
import { BRFRemoteDelegate } from './brf.instance';
import { createBRF5 } from './create-brf';
import { detectSmile } from './utils/smile';
import { detectYawn } from './utils/yawn';
import { detectBlink } from './utils/blink';

export class BRFTracker implements PlatformFaceTracker {
	buffer: number[][] = [];
	last: number[];

	private webcam: WebCamSource;
	private brf: RpcPort<BRFRemoteDelegate>;

	async init(device: string, abort: AbortController): Promise<void> {
		this.webcam = await abort.insure(WebCamSource.create(device));
		this.brf = createBRF5();
		await abort.insure(this.brf.instance.init());
	}

	async track(abort: AbortController): Promise<number[]> {
		if (this.buffer.length === 0) {
			const img = this.webcam.getImageData();
			const face = await abort.insure(this.brf.instance.update(img, [img.data.buffer]));
			const position = face.vertices;
			const lm = face.landmarks;
			const kConstant = Math.sqrt(getDistanceSq(position, 0_30, 27));
			const leftEyeBlinked = detectBlink(lm[36], lm[39], lm[37], lm[38], lm[41], lm[40]);
			const rightEyeBlinked = detectBlink(lm[45], lm[42], lm[44], lm[43], lm[46], lm[47]);
			const angleX = face.rotationY;
			const angleY = -face.rotationX;
			const angleZ = -face.rotationZ;
			const blendshape =
				face.confidence > 0.5
					? [
							angleX,
							angleY,
							angleZ,
							angleX / 3,
							angleY / 3,
							angleZ / 3,
							0,
							0,
							limit(inverseLerp(0.9, 1, leftEyeBlinked), 0, 1),
							limit(inverseLerp(0.9, 1, rightEyeBlinked), 0, 1),
							(Math.sqrt(getDistanceSq(position, 0_38, 0_20)) / kConstant - 0.6) * 4,
							(Math.sqrt(getDistanceSq(position, 0_43, 0_23)) / kConstant - 0.6) * 4,
							0,
							0,
							0,
							0,
							detectSmile(face) + 0.5,
							inverseLerp(0, 0.6, detectYawn(face.vertices)),
					  ]
					: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0];

			if (!this.last) {
				this.buffer.push(blendshape);
			} else {
				this.buffer.push(this.last);
				this.buffer.push(this.last.map((v, i) => (v + blendshape[i]) / 2));
			}
			this.last = blendshape;
		}
		return this.buffer.shift();
	}

	async release(): Promise<void> {
		this.webcam.release();
		// await this.brf.instance.release(); //not really needed in worker context
		this.brf.terminate();
	}
}

function getDistanceSq(position: number[], a: number, b: number): number {
	return Math.pow(position[a * 2] - position[b * 2], 2) + Math.pow(position[a * 2 + 1] - position[b * 2 + 1], 2);
}

function inverseLerp(a: number, b: number, t: number): number {
	return (t - a) / (b - a);
}

function limit(a: number, min: number, max: number): number {
	if (a > max) {
		return max;
	} else if (a < min) {
		return min;
	} else {
		return a;
	}
}

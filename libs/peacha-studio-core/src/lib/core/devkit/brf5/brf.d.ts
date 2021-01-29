export declare interface BRFInit {
	appId?: string;
	binaryLocation?: string;
	modelLocation?: string;
	modelChunks?: number;
	binaryProgress: (e) => void;
	binaryError: (e) => void;
	onInit: (brfv5Manager: BRFv5Manager, brfv5Config: BRFv5Config) => void;
}

export declare interface BRFv5Manager {
	reset(): void;
	configure(config: BRFv5Config): void;
	update(imageData: ImageData): void;
	getFaces(): BRFv5Face[];
	getMergedRects(): BRFv5Rectangle[];
	getDetectedRects(): BRFv5Rectangle[];
	setupModel(chunk, data): void;
}

export declare interface BRFv5Landmark {
	x: number;
	y: number;
	setTo(x, y): void;
}

export enum BRFv5State {
	FACE_DETECTION = 'face_tection',
	FACE_TRACKING = 'face_tracking',
	RESET = 'reset',
}

export declare interface BRFv5Face {
	state: BRFv5State;
	confidence: number;
	landmarks: BRFv5Landmark[];
	vertices: Array<number>;
	bounds: BRFv5Rectangle;
	scale: number;
	translationX: number;
	translationY: number;
	rotationX: number;
	rotationY: number;
	rotationZ: number;
}

export class BRFv5Config {
	enableFaceTracking?: boolean;
	imageConfig: BRFv5ImageConfig;
	faceTrackingConfig: BRFv5FaceTrackingConfig;
	faceDetectionConfig: BRFv5FaceDetectionConfig;
}

export class BRFv5ImageConfig {
	inputWidth: number;
	inputHeight: number;
}

export class BRFv5FaceDetectionConfig {
	regionOfInterest: BRFv5Rectangle;
	minFaceSize: number;
	maxFaceSize: 480;
	faceSizeIncrease: number;
	stepSize: number;
	minNumNeighbors: number;
	rectMergeFactor: number;
	rectSkipFactor: number;
	filterNoise: boolean;
}

export class BRFv5FaceTrackingConfig {
	regionOfInterest: BRFv5Rectangle;
	numFacesToTrack: number;
	numTrackingPasses: number;
	minFaceScaleStart: number;
	maxFaceScaleStart: number;
	maxRotationXStart: number;
	maxRotationYStart: number;
	maxRotationZStart: number;
	confidenceThresholdStart: number;
	minFaceScaleReset: number;
	maxFaceScaleReset: number;
	maxRotationXReset: number;
	maxRotationYReset: number;
	maxRotationZReset: number;
	confidenceThresholdReset: number;
	enableStabilizer: boolean;
	enableFreeRotation: boolean;
}

export class BRFv5Rectangle {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
	constructor(x, y, w, h);
	setTo(x, y, w, h): void;
}

export const brfv5Module: (config: BRFInit) => BRFV5Module;

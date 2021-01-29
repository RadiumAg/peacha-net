import { WorkerInstance, RpcAction, Host } from '../rpc';
import { BRFv5Manager, brfv5Module, BRFv5Face } from './brf';

@Host()
export class BRFRemoteInstance extends WorkerInstance implements BRFRemoteDelegate {
	manager: BRFv5Manager = null;

	@RpcAction()
	async init(): Promise<void> {
		this.manager = await this.initializeBRFv5();
	}

	@RpcAction()
	update(image_data: ImageData): Promise<BRFv5Face> {
		this.manager.update(image_data);
		const face = this.manager.getFaces()[0];
		return Promise.resolve(face);
	}

	@RpcAction()
	async release(): Promise<void> {
		this.manager.reset();
		this.manager = null; // 不提供回收接口，内存溢出预定（但webworker在被terminate之后没有影响）
	}

	private initializeBRFv5(): Promise<BRFv5Manager> {
		return new Promise((res, rej) => {
			brfv5Module({
				appId: 'test.model',
				binaryLocation: '/assets/models/brfv5_js_rn280820_v5.1.5_commercial.brfv5',
				modelLocation: '/assets/models/68l_c',
				modelChunks: 8,
				binaryError: e => {
					rej(e);
				},
				binaryProgress: () => {
					//
				},
				onInit: (m, brfv5Config) => {
					brfv5Config.enableFaceTracking = true;
					brfv5Config.imageConfig.inputHeight = 480;
					brfv5Config.imageConfig.inputWidth = 640;
					// brfv5Config.faceDetectionConfig.minFaceSize = 192
					brfv5Config.faceTrackingConfig.numFacesToTrack = 1;
					brfv5Config.faceTrackingConfig.numTrackingPasses = 3;
					brfv5Config.faceTrackingConfig.enableFreeRotation = true;
					brfv5Config.faceTrackingConfig.maxRotationZReset = 999;
					// brfv5Config.faceTrackingConfig.minFaceScaleReset = 0.6
					//  brfv5Config.faceTrackingConfig.maxFaceScaleReset = 1
					// brfv5Config.enableFaceTracking = true;
					brfv5Config.faceTrackingConfig.confidenceThresholdReset = 0.3;

					brfv5Config.faceTrackingConfig.enableStabilizer = false;

					// e.reset();
					m.configure(brfv5Config);
					res(m);
				},
			});
		});
	}
}

export interface BRFRemoteDelegate {
	init(): Promise<void>;
	update(ImageData: ImageData, transfer?: [Transferable]): Promise<BRFv5Face>;
	release(): Promise<void>;
}

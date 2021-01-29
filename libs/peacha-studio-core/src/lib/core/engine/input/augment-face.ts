import { nextFrame } from '../utils';
import { InjectionToken } from '@angular/core';
import { AbortedError } from '../utils/promise';
import { BRFTracker } from '../../devkit/brf5';

export type FaceAlignmentResult = number[];

export interface PlatformInputDevice {
	readonly displayName: string;
	// readonly id: string;
	readonly platformDeviceId: string;
}

export const PLATFORM_FT_DEVICE_ENUMERATE = new InjectionToken<EnumerateDeviceFunciton>('platform face track device enum');

export const PLATFORM_FT_FACTORY = new InjectionToken<PlatformTrackerFactory>('platform tracker factory');

export type PlatformTrackerFactory = () => PlatformFaceTracker;

export const HTMLTrackerFactory = () => new BRFTracker();

export type EnumerateDeviceFunciton = () => Promise<PlatformInputDevice[]>;

export const HTMLEnumerateDeviceFunciton: EnumerateDeviceFunciton = async () => {
	const devices = await navigator.mediaDevices.enumerateDevices();
	return devices
		.filter(x => x.kind === 'videoinput')
		.map(x => {
			return {
				displayName: x.label,
				platformDeviceId: x.deviceId,
			};
		});
};

export interface PlatformFaceTracker {
	init(platofrmDeviceId?: string, abort?: AbortController): Promise<void>;
	track(abort?: AbortController): Promise<FaceAlignmentResult>;
	release(): Promise<void>;
}

export async function coroutineFaceTrack(
	tracker: PlatformFaceTracker,
	props: {
		onrequestdevice: () => Promise<string>;
		ontrackstart?: () => void;
		onfaceupdate: (face: FaceAlignmentResult) => void;
	},
	abort: AbortController
): Promise<void> {
	try {
		const deviceId = await abort.insure(props.onrequestdevice());
		await tracker.init(deviceId, abort); //
	} catch (e) {
		console.log(e);
		throw e; // 没救了等死吧
	}
	props.ontrackstart?.();
	try {
		for (; !abort.signal.aborted; ) {
			const ret = await tracker.track(abort);
			props.onfaceupdate(ret);
			await nextFrame(); // 免得卡死了
			// output ret
		}
	} catch (e) {
		if (e instanceof AbortedError) {
			// normal
		} else {
			console.log(e);
			throw e; // 没救了等死吧
		}
	} finally {
		await tracker.release();
	}
}

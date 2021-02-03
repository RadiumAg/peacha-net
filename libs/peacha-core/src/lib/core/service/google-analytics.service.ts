import { Injectable } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/ban-types
declare let gtag: Function;

@Injectable()
export class GoogleAnalyticsService {
	constructor() { }

	private eventEmitter(eventName: string, eventValue: any) {
		gtag('event', eventName, {
			...eventValue,
		});
	}
}

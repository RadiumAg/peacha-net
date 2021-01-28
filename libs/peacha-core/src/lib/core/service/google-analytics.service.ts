import { Injectable } from '@angular/core';

declare let gtag: Function;

@Injectable()
export class GoogleAnalyticsService {

    constructor() { }

    private eventEmitter(
        eventName: string,
        eventValue: any) {
        gtag('event', eventName, {
            ...eventValue
        });
    }
}

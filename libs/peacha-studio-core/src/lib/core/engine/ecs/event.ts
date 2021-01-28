import { Injectable } from '@angular/core';

export type Event<T = any> = {
    type: any;
    payload: T;
};

@Injectable()
export class EventHub {

    private hubPipeMap: {
        [channel: string]: Array<Event>
    } = {};

    emitEvent<T>(channel: string, event: Event<T>): void {
        if (this.hubPipeMap[channel]) {
            this.hubPipeMap[channel].push(event);
        } else {
            this.hubPipeMap[channel] = [event];
        }
    }

    comsumeEvent<T>(channel: string): Event<T> {
        const pipe = this.hubPipeMap[channel];
        if (pipe && pipe.length >= 1) {
            return pipe.shift();
        } else {
            return undefined;
        }
    }

    *consumeEvents<T>(channel: string): Iterable<Event<T>> {
        const pipe = this.hubPipeMap[channel];
        while (pipe && pipe.length >= 1) {
            yield pipe.shift();
        }
        return;
    }

    constructor() {
    }
}

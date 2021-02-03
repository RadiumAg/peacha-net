import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SharedService {
	private emitChangeSource = new BehaviorSubject<number>(0);

	changeEmitted$ = this.emitChangeSource;

	emitChange(change: any) {
		this.emitChangeSource.next(change);
	}
}

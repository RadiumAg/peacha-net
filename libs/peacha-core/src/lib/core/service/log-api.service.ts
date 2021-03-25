import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';

enum LogTypes {
	Debug = 1,
	Info,
	Warn,
	Error,
	Fatal,
}

@Injectable({ providedIn: 'root' })
export class LogApiService {
	constructor(public http: HttpClient) {}

	async debug(message: string) {
		this.http
			.post('/log', {
				d: message,
				l: LogTypes.Debug,
			})
			.pipe(take(1))
			.subscribe();
	}
}

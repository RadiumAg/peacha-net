import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class CommmonApiService {
	constructor(private http: HttpClient) { }

	// eslint-disable-next-line @typescript-eslint/ban-types
	readonly uploadFile = (fileFormData: FormData) => this.http.post('/common/upload_file',fileFormData
		,{ reportProgress: true,observe: 'events' });
}

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root',
})
export class CommmonApiService {
    constructor(private http: HttpClient) {}

    readonly uploadFile = (fileFormData: FormData, configs?: {}) =>
        this.http.post('/common/upload_file', fileFormData, configs)
}

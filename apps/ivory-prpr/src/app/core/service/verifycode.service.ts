import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class VerifycodeService {
    constructor(private http: HttpClient){

    }

    queryVerifyCode(target: string, type: EVerifycodeType){
        return this.http.post<void>('/common/request_verify_code', {
            t: target,
            p: type
        }).pipe();
    }
}

export enum EVerifycodeType {
    Register = 0,
    ResetPW = 1,
    ResetPhone = 2,
    ResetEmail = 3,
    Login = 4
}

import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiSrevice } from 'src/app/core/service/api.service';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Exchange } from 'src/app/core/model/exchange';
import { isEmptyInputValue } from 'src/app/core/commom/common';

@Component({
    selector: 'ivo-cdk-exchange',
    templateUrl: './cdk-exchange.component.html',
    styleUrls: ['./cdk-exchange.component.less'],
})
export class CdkExchangeComponent implements OnInit {
    constructor(
        private apiServices: ApiSrevice,
        private httpClient: HttpClient,
        private translate: TranslateService
    ) {}
    errorDescription$ = new BehaviorSubject<string>('');
    exchangeData$ = new BehaviorSubject<Exchange>({
        count: '0',
        list: [],
    });
    page$ = new BehaviorSubject<number>(1);
    pageSize = 9;
    buttonDisabled = false;

    exChange(cdkCode: string) {
        if (isEmptyInputValue(cdkCode)) {
            this.errorDescription$.next(this.getTranslate('cdk_exchange.input_required'));
            return;
        }
        this.exchangeCode(cdkCode);
    }

    getExchangeData(page: number) {
        const params = new HttpParams()
            .set('p', page.toString())
            .set('s', this.pageSize.toString());
        this.httpClient
            .get(this.apiServices.code_uselog, { params })
            .subscribe((x: Exchange) => {
                this.exchangeData$.next(x);
            });
    }

    exchangeCode(cdkCode: string) {
        this.startRequest();
        this.httpClient.post(this.apiServices.code, { c: cdkCode }).subscribe({
            error: (x: { code: number; descrption: string }) => {
                this.endRequest();
                const errorMessage = this.setErrorMessage(x.code);
                this.errorDescription$.next(errorMessage);
            },
            complete: () => {
                this.endRequest();
                this.errorDescription$.next(this.getTranslate('cdk_exchange.successful_exchange'));
                this.page$.next(this.page$.getValue());
            },
        });
    }

    startRequest() {
        this.buttonDisabled = true;
    }

    endRequest() {
        this.buttonDisabled = false;
    }

    private getTranslate(key: string){
        let result;
        this.translate.get(key).subscribe((x) => {
            result = x;
        });
        return result;
    }

    private setErrorMessage(httpCode: number) {
        let errorMessage = '';
        switch (httpCode) {
            case 234:
            case 408:
                errorMessage = this.getTranslate(
                    'cdk_exchange.invalid_exchange_code'
                );
                break;
            case 235:
                errorMessage = this.getTranslate(
                    'cdk_exchange.repeat'
                );
                break;
            default:
                errorMessage =  this.getTranslate(
                    'cdk_exchange.unknew_error'
                );
        }
        return errorMessage;
    }

    ngOnInit(): void {
        this.page$.subscribe((page) => {
            this.getExchangeData(Number(page) - 1);
        });
    }
}

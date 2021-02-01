import { Pipe, PipeTransform } from '@angular/core';
import { formatDate, DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'mydate',
})
export class MydatePipe implements PipeTransform {
    constructor(private translateService: TranslateService) {}

    transform(value: any, args: string): any {
        //return formatDate(value as Date,args,'zh-cn')
        return new DatePipe(this.translateService.getBrowserCultureLang()).transform(value, args, 'UTC');
    }
}

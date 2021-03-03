import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeFormat',
})
export class TimeFormatPipe implements PipeTransform {
    transform(value: number, args?: string): string {
        const h = Math.floor(value / 3600);
        const m = Math.floor((value % 3600) / 60);
        const s = Math.floor((value % 3600) % 60);
        return [h || '', m || ''].join(h ? '时' : '').concat(['', s || ''].join(m ? '分' : '')).concat(s ? '秒' : '');

    }

    PrefixZero(num, n) {
        return (Array(n).join('0') + num).slice(-n);
    }
}

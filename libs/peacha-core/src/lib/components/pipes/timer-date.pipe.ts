import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'timerdate',
})
export class TimerDatePipe implements PipeTransform {
	transform(value: number): string {
		const d = String(value / 1000 / 60 / 60 / 24).split('.')[0];
		const ld = value / 1000 / 60 / 60 / 24 - Number(d);
		const h = String(ld * 24).split('.')[0];
		const lh = ld * 24 - Number(h);
		const m = String(lh * 60).split('.')[0];
		const lm = lh * 60 - Number(m);
		const s = String(lm * 60).split('.')[0];

		if (value / 1000 <= 1) {
			return '0';
		} else {
			if (value / 1000 / 60 / 60 <= 1) {
				return PrefixZero(m, 2) + ':' + PrefixZero(m, 2);
			} else {
				if (value / 1000 / 60 / 60 / 24 <= 1) {
					return h + '小时' + m + '分钟';
				} else {
					return d + '天' + h + '小时';
				}
			}
		}
	}
}
function PrefixZero(num, n) {
	return (Array(n).join('0') + num).slice(-n);
}

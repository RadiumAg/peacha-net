import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'changeUnit' })
export class ChangeUnitPipe implements PipeTransform {
	transform(value: number): string {
		if (value != undefined) {
			if (value > 10000) {
				return (value / 10000).toFixed(1) + 'w';
			} else {
				return value.toString();
			}
		} else {
			return (0).toString();
		}
	}
}

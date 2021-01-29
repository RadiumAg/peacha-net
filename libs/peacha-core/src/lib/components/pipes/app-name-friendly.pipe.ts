import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'ivoNameFriendly',
})
export class IvoNameFriendlyPipe implements PipeTransform {
	transform(value: string): string {
		let dot = value.lastIndexOf('.');
		if (dot != -1) {
			if (value) {
				return value.substring(0, dot);
			} else {
				return value;
			}
		} else {
			return value;
		}
	}
}

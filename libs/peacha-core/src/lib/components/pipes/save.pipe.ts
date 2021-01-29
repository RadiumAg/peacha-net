import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'save',
})
export class SavePipe implements PipeTransform {
	transform(value: number): string {
		return (value / 1048576).toFixed(2);
	}
}

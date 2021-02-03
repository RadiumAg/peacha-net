import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
	name: 'mydate',
})
export class MydatePipe implements PipeTransform {
	transform(value: any, args: string): any {
		//return formatDate(value as Date,args,'zh-cn')
		return new DatePipe('zh-cn').transform(value, args, 'UTC');
	}
}

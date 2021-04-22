import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'ivo-tags',
	templateUrl: './tags.component.html',
	styleUrls: ['./tags.component.less'],
})
export class TagsComponent {
	constructor(private router: Router) { }

	colors = [
		'#01A3A4',
		'#FF9494',
		'#FF778F',
		'#E694FF',
		'#9480FF',
		'#8AD14C',
		'#FFC231',
		'#FF8E37',
		'#A58467',
		'#8CAAEE',
		'#F19066',
		'#0ABDE3',
		'#C24E6F',
		'#546DE5',
		'#E66767'
	]; //15

	@Input() tags: {
		id: number;
		name: string;
	}[];

	curColor = '';

	computeHash(v: string) {
		let hash = 0,
			i,
			chr;
		for (i = 0; i < v.length; i++) {
			chr = v.charCodeAt(i);
			hash = (hash << 5) - hash + chr;
			hash |= 0; // Convert to 32bit integer
		}
		this.curColor = this.colors[Math.abs(hash) % 15];
		return this.colors[Math.abs(hash) % 15];
	}

	computeHashBoxShaow() {
		return '1px 2px 8px' + this.curColor;
	}

	searchWork(id: number, k: string) {
		this.router.navigate(['hotTagWork'], {
			queryParams: {
				id: id,
				k: k,
				page: 1,
			},
		});
	}
}

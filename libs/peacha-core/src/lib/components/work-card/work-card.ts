import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'ivo-work-card',
	templateUrl: './work-card.html',
	styleUrls: ['./work-card.less'],
})
export class WorkCard implements OnInit {
	@Input() work: any;

	timeDif: number;
	timetype: number;
	showtime: string;
	constructor(private router: Router) { }

	ngOnInit() {
		this.timeDif = Math.ceil((new Date().getTime() - this.work?.publishTime) / (60 * 60 * 1000));

		if (this.timeDif == 1) {
			this.timetype = 1;
			this.showtime = (Math.floor((new Date().getTime() - this.work?.publishTime) / (60 * 1000)) === 0
				? 1 :
				Math.floor((new Date().getTime() - this.work?.publishTime) / (60 * 1000)))
				+ '分钟前';
		} else if (this.timeDif > 1 && this.timeDif < 25) {
			this.timetype = 2;
			this.showtime = Math.floor((new Date().getTime() - this.work?.publishTime) / (60 * 60 * 1000)) + '小时前';
		} else if (this.timeDif > 24 && this.timeDif < 721) {
			this.timetype = 3;
			this.showtime = Math.floor((new Date().getTime() - this.work?.publishTime) / (24 * 60 * 60 * 1000)) + '天前';
		} else if (this.timeDif > 720 && this.timeDif < 8761) {
			this.timetype = 4;
			this.showtime = Math.floor((new Date().getTime() - this.work?.publishTime) / (30 * 24 * 60 * 60 * 1000)) + '月前';
		} else {
			this.timetype = 5;
			this.showtime = Math.floor((new Date().getTime() - this.work?.publishTime) / (12 * 30 * 24 * 60 * 60 * 1000)) + '年前';
		}
	}

}

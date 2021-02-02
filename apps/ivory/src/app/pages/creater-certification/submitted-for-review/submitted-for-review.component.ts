import { ActivatedRoute } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'ivo-submitted-for-review',
	templateUrl: './submitted-for-review.component.html',
	styleUrls: ['./submitted-for-review.component.less'],
})
export class SubmittedForReviewComponent implements OnInit {
	constructor(private route: ActivatedRoute) { }
	@Input() ImgSrc = '/assets/image/submitted_for_review/01.png';
	@Input() Title = '您已提交审核，请耐心等待';
	@Input() backRoute = '/setting/security';
	@Input() ButtonTitle = '返回';
	@Input() reason = '';

	private setData() {
		this.Title = this.route.snapshot.data.title || this.Title;
		this.ImgSrc = this.route.snapshot.data.imgSrc || this.ImgSrc;
		this.backRoute = this.route.snapshot.data.backRoute || this.backRoute;
		this.ButtonTitle = this.route.snapshot.data.buttonTitle || this.ButtonTitle;
		this.reason = this.route.snapshot.queryParams.reason;
	}

	ngOnInit(): void {
		this.setData();
	}
}

import { Component, ViewChild, ElementRef, Renderer2, Inject, AfterViewInit } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { ModalRef } from '@peacha-core';
import { MODAL_DATA_TOKEN } from 'libs/peacha-core/src/lib/core/tokens';

@Component({
	selector: 'ivo-company-modal',
	templateUrl: './company-modal.component.html',
	styleUrls: ['./company-modal.component.less'],
})
export class CompanyModalComponent<T> implements AfterViewInit {
	@ViewChild('searchInput', { read: ElementRef })
	searchInput: ElementRef;
	@ViewChild('staff', { read: ElementRef })
	staff: ElementRef;
	target;
	title = '';
	tips = '';
	imgprototype = 'avatar';
	titleprototype = 'nickname';
	idprototype = 'id';
	searchKey: string[] = [];
	selectElement: HTMLDivElement;
	model$ = new BehaviorSubject<T[]>([]);
	imgStyle: 'react' | 'circul' = 'circul';
	symbolprototype = '';
	findKey = '';
	pageKey = 'p';
	pageValue = 0;
	pageSizeKey = 's';
	pageSizeValue = 10;
	hasData = true;
	isLoading = true;
	constructor(
		private modalRef: ModalRef<CompanyModalComponent<T>>,
		private http: HttpClient,
		private re2: Renderer2,
		@Inject(MODAL_DATA_TOKEN)
		private initData: {
			pageKey: string;
			pageSizeKey: string;
			target: string;
			findKey: string;
			title: string;
			tips: string;
			result: T;
			imgprototype: string;
			titleprototype: string;
			idprototype: string;
			symbolprototype: string;
			searchKey: string[];
			imgStyle: 'react' | 'circul';
		}
	) {
		this.target = initData.target;
		this.title = initData.title;
		this.imgStyle = initData.imgStyle;
		this.symbolprototype = initData.symbolprototype;
		this.findKey = initData.findKey;
		this.tips = initData.tips;
		this.imgprototype = initData.imgprototype;
		this.titleprototype = initData.titleprototype;
		this.idprototype = initData.idprototype;
		this.searchKey = initData.searchKey;
		this.pageSizeKey = initData.pageSizeKey;
		this.pageKey = initData.pageKey;
	}

	ngAfterViewInit(): void {
		this.search();
	}

	complete() {
		if (this.selectElement) {
			const id = this.selectElement.children.item(0)?.getAttribute('id')?.valueOf();
			const res = new Map();
			res.set('res', { select: true, [this.idprototype]: id });
			this.modalRef.close(res);
		}
	}

	cancel() {
		this.modalRef.close(undefined);
	}

	select(e: Event) {
		this.setActive(e.target as HTMLElement);
	}

	private setActive(element: HTMLElement) {
		if (element.attributes.getNamedItem('id')?.value === 'list_body') {
			this.re2.addClass(element, 'active');
			this.selectElement = element as HTMLDivElement;
			const children = (this.staff.nativeElement as HTMLDivElement).children;
			for (let i = 0; i < children.length; i++) {
				const child = children.item(i);
				if (element !== child) {
					this.re2.removeClass(child, 'active');
				}
			}
		} else {
			const children = (this.staff.nativeElement as HTMLDivElement).children;
			element = element.parentElement;
			this.selectElement = element as HTMLDivElement;
			this.re2.addClass(element, 'active');
			for (let i = 0; i < children.length; i++) {
				const child = children.item(i);
				if (element !== child) {
					this.re2.removeClass(child, 'active');
				}
			}
		}
	}

	/**
	 * @description 搜索
	 */
	search() {
		this.resetParam();
		this.model$.next([]);
		this.getData();
	}

	/**
	 * @description 充值请求参数
	 */
	private resetParam() {
		this.pageValue = 0;
		this.hasData = true;
	}

	/**
	 * @description 搜索
	 */
	getData() {
		const k = (this.searchInput.nativeElement as HTMLInputElement).value;
		this.isLoading = true;
		const params = this.getParams(this.searchKey)
			.set(this.findKey, k)
			.set(this.pageKey, this.pageValue.toString())
			.set(this.pageSizeKey, this.pageSizeValue.toString());
		this.http
			.get<{ list: T[] }>(this.target, { params })
			.pipe(
				map(x => {
					return x.list;
				})
			)
			.subscribe(x => {
				this.isLoading = false;
				if (x.length > 0) {
					this.model$.next(this.model$.getValue().concat(x));
				} else {
					this.hasData = false;
				}
			});
	}

	onScroll(e: Event) {
		const element = e.target as HTMLDivElement;
		if (Math.floor(element.scrollHeight - element.scrollTop) === element.clientHeight) {
			if (!this.hasData || this.isLoading) {
				return;
			}
			this.pageValue++;
			this.getData();
		}
	}

	private getParams(target: any[]): HttpParams {
		const array = [...target];
		return array.reduce((total, currentvalue, currentindex) => {
			if (typeof currentvalue === 'object') {
				for (const p in currentvalue) {
					if (p) {
						total = total.set(p, currentvalue[p]);
					}
				}
			}
			return total;
		}, new HttpParams());
	}
}

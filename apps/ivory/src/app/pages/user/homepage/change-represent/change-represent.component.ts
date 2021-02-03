import { Component, Inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, EMPTY } from 'rxjs';
import { switchMap, tap, take } from 'rxjs/operators';
import { ModalRef, ModalService, MODAL_DATA_TOKEN } from '@peacha-core';
import { PopTips } from '@peacha-core/components';

type Works = {
	count: number;
	list: {
		id: number;
		cover: string;
		name: string;
		like_count: number;
		collect_count: number;
		comment_count: number;
		price: number;
		type: number;
		publishtime: string;
		description: string;
		state: number;
	}[];
};

@Component({
	selector: 'ivo-change-represent',
	templateUrl: './change-represent.component.html',
	styleUrls: ['./change-represent.component.less'],
})
export class ChangeRepresentComponent {
	@ViewChild('box') box: ElementRef;
	@ViewChild('ne') ne: ElementRef;

	@ViewChild('boxone') boxone: ElementRef;
	@ViewChild('neone') neone: ElementRef;
	constructor(
		private http: HttpClient,
		private modalRef: ModalRef<ChangeRepresentComponent>,
		@Inject(MODAL_DATA_TOKEN) public list: [any, any],
		private modal: ModalService
	) { }

	selected = this.list[1];

	is = true;

	work$ = this.http
		.get<Works>(`/work/get_works?u=${this.list[0]._value.id}&p=0&s=12&ws=-1&k=&c=-1`)
		.pipe(
			take(1),
			tap(s => {
				s.list.map(a => {
					this.allworkList.push(a);
				});
				this.allWorksCount$.next(s.count);
				this.allPage$.next(1);
			})
		)
		.subscribe();

	allworkList = [];
	allWorksCount$ = new BehaviorSubject<number>(0);


	page$ = new BehaviorSubject<number>(0);
	allPage$ = new BehaviorSubject<number>(0);
	keyword$ = new BehaviorSubject<string>('');

	goBack() {
		this.selected = [];
		this.modalRef.close();
	}


	search(keyword: HTMLInputElement) {
		this.allworkList = [];
		this.allWorksCount$.next(0);
		this.keyword$.next(keyword.value);
		if (this.is) {
			this.is = false;
			this.http
				.get<Works>(`/work/get_works?u=${this.list[0]._value.id}&p=0&k=${keyword.value}&s=12&ws=-1&c=-1`)
				.pipe(
					take(1),
					tap(s => {
						s.list.map(a => {
							this.allworkList.push(a);
						});
						this.allWorksCount$.next(s.count);
						this.allPage$.next(1);
					})
				)
				.subscribe(_ => {
					this.is = true;
				});
		}
	}


	@HostListener('scroll', ['$event']) public scrolled(_$event: Event) {
		if (this.box.nativeElement.scrollHeight - this.box.nativeElement.scrollTop == this.ne.nativeElement.clientHeight - 25) {
			combineLatest(this.page$, this.keyword$, this.allWorksCount$)
				.pipe(
					take(1),
					switchMap(([p, k, count]) => {
						if (count / 12 > p) {
							return this.http.get<Works>(`/work/get_works?u=${this.list[0]._value.id}&p=${p}&k=${k}&s=12&ws=-1&c=-1`).pipe(
								tap(s => {
									s.list.map(a => {
										this.allworkList.push(a);
									});
									this.page$.next(p + 1);
								})
							);
						}
						return EMPTY;
					})
				)
				.subscribe();
		}
	}
	@HostListener('scroll', ['$event']) public scrolledOne(_$event: Event) {
		if (this.boxone.nativeElement.scrollHeight - this.boxone.nativeElement.scrollTop == this.neone.nativeElement.clientHeight - 25) {
			combineLatest(this.allWorksCount$, this.allPage$)
				.pipe(
					take(1),
					switchMap(([count, p]) => {
						if (count / 12 > p) {
							return this.http.get<Works>(`/work/get_works?u=${this.list[0]._value.id}&p=${p}&s=12&k=&ws=-1&c=-1`).pipe(
								tap(s => {
									s.list.map(a => {
										this.allworkList.push(a);
									});
									this.allPage$.next(p + 1);
								})
							);
						}
						return EMPTY;
					})
				)
				.subscribe();
		}
	}

	choiceThis(id: number, work: any) {
		if (this.selected.indexOf(id) == -1) {
			this.selected.push(id);
			this.http
				.post('/work/set_represent_work', {
					w: this.selected,
				})
				.subscribe(
					_s => {
						this.modalRef.close([work, id]);
					},
					_e => {
						this.selected.pop();
					}
				);
		} else {
			this.modal.open(PopTips, ['该作品已设置为代表作', false]);
		}
	}
}

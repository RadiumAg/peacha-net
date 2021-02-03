import { Component, ChangeDetectorRef, ViewChild, ElementRef, Input } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { tap, switchMap, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ModelComment } from '../model';
import { CommentEntryComponent } from '../comment-entry/comment-entry.component';
import { Select } from '@ngxs/store';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { ModalService, Toast, UserState } from '@peacha-core';


@Component({
	selector: 'ivo-comment-area',
	templateUrl: './comment-area.fragment.html',
	styleUrls: ['./comment-area.fragment.less']
})
export class CommentAreaFragment {
	all: {
		count: number;
		list: ModelComment[];
	};
	page$ = new BehaviorSubject(1);

	comment_aid$ = new BehaviorSubject(0);

	@Input() set aid(aid: number) {
		this.comment_aid$.next(aid);
	}

	@Select(UserState.avatar)
	avatar$: Observable<string>;

	@Select(UserState.isLogin)
	isLogin$: Observable<boolean>;

	@Select(UserState.basicInfo)
	basicInfo$: Observable<{
		nickname: string;
		avatar: string;
		id: number;
		num_followed: number;
		num_following: number;
		banner: string;
	}>;

	textarea = new FormControl('');

	one: ModelComment;
	@ViewChild('textq') text: ElementRef<HTMLTextAreaElement>;
	@ViewChild('textT') textt: ElementRef<HTMLTextAreaElement>;

	show = false;


	comments$ = combineLatest([this.page$, this.comment_aid$]).pipe(
		shareReplay(),
		switchMap(([page, aid]) => {
			return this.http
				.get<{
					count: number;
					list: ModelComment[];
				}>(`/comment/get_comment?c=${aid}&s=10&p=${page - 1}`)
				.pipe(
					tap(a => {
						this.all = a;
						this.show = true;
					})
				);
		})
	);

	rootid: string;

	lastActived?: CommentEntryComponent = undefined;

	tips(_el: HTMLTextAreaElement, input: ElementRef) {
		// const a = el.getBoundingClientRect();
		this.textarea.valueChanges.subscribe(s => {
			if (s.length > 200) {
				this.toast.show('最多只能发200字的评论', {
					type: 'error',
					el: input,
					timeout: 1000,
				});
			}
		});
	}

	send(_el: HTMLTextAreaElement, input: ElementRef) {
		// const a = el.getBoundingClientRect();

		if (this.text.nativeElement.value) {
			this.comment_aid$.subscribe(aid => {
				this.http
					.post<{ id: number }>('/comment/comment', {
						a: aid,
						c: this.text.nativeElement.value,
					})
					.subscribe(
						s => {
							this.all.count++;
							this.basicInfo$.subscribe(info => {
								this.one = {
									id: s.id,
									nickname: info.nickname,
									userid: info.id,
									avatar: info.avatar,
									content: this.text.nativeElement.value,
									comment_time: Date.now(),
									like_count: 0,
									is_like: 0,
									comment_count: 0,
									comment_list: [],
								};
							});
							this.all.list.unshift(this.one);
							this.cdf.markForCheck();
							//console.log('success');
							this.text.nativeElement.value = '';
						},
						e => {
							if (Math.abs(e.code) == 122) {
								// this.modal.open(Tips)
								this.toast.show('重复评论', {
									type: 'error',
									el: input,
									timeout: 1000,
								});
							}
						}
					);
			});
		} else {
			this.toast.show('不能发送空评论', {
				type: 'error',
				el: input,
				timeout: 1000,
			});
		}
	}

	sendTwo(_el: HTMLTextAreaElement, input: ElementRef) {
		// const a = el.getBoundingClientRect();
		if (this.textt.nativeElement.value) {
			this.comment_aid$.subscribe(aid => {
				this.http
					.post<{ id: number }>('/comment/comment', {
						a: aid,
						c: this.textt.nativeElement.value,
					})
					.subscribe(
						s => {
							this.all.count++;
							this.basicInfo$.subscribe(info => {
								this.one = {
									id: s.id,
									nickname: info.nickname,
									userid: info.id,
									avatar: info.avatar,
									content: this.textt.nativeElement.value,
									comment_time: Date.now(),
									like_count: 0,
									is_like: 0,
									comment_count: 0,
									comment_list: [],
								};
							});
							this.all.list.unshift(this.one);
							this.cdf.markForCheck();
							//console.log('success');
							this.textt.nativeElement.value = '';
						},
						e => {
							if (Math.abs(e.code) == 122) {
								this.toast.show('重复评论', {
									type: 'error',
									el: input,
									timeout: 1000,
								});
							}
						}
					);
			});
		} else {
			this.toast.show('不能发送空评论', {
				type: 'error',
				el: input,
				timeout: 1000,
			});
		}
	}
	toLogin() {
		const a =
			(this.route.snapshot as any)._routerState.url.split('/')[1] + '/' + (this.route.snapshot as any)._routerState.url.split('/')[2];
		this.router.navigate(['/login'], {
			queryParams: {
				return: a,
			},
		});
	}


	toPage(p: number) {
		this.page$.next(p);
	}

	constructor(
		private http: HttpClient,
		private cdf: ChangeDetectorRef,
		private route: ActivatedRoute,
		private router: Router,
		private modal: ModalService,
		private toast: Toast
	) {
		this.route.queryParams
			.pipe(
				tap(s => {
					if (s) {
						const compage = Number(s.root);
						this.rootid = s.rootid;
						if ((compage + 1) / 10 > 1) {
							this.page$.next(Math.ceil((compage + 1) / 10));
						}
					}
				})
			)
			.subscribe(_s => { });
	}



	onactive(_cid: number, t: CommentEntryComponent) {
		if (this.lastActived) {
			this.lastActived.active = false;
			//mark for check
			this.cdf.markForCheck();
		}
		this.lastActived = t;
		t.active = true;
		this.cdf.markForCheck();
	}
}

export const COMMNET_AREA_PAGE_SIZE = 20;


import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	Input,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { UserState, ChatStartService, ZoomService, Toast, ModalService, DropDownService } from '@peacha-core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';
import { RemoveHistroyAll } from 'libs/peacha-core/src/lib/core/state/chat.action';
import { ChatState } from 'libs/peacha-core/src/lib/core/state/chat.state';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { IllustZoomModalComponent } from '../../work/illust-zoom-modal/illust-zoom-modal.component';

@Component({
	selector: 'ivo-chat',
	templateUrl: './chat.page.html',
	styleUrls: ['./chat.page.less'],
})
export class ChatPage implements OnInit, OnDestroy {
	@Select(UserState.avatar)
	avatar$: Observable<string>;

	@Select(UserState.id)
	id$: Observable<number>;

	@Select(ChatState.list)
	list$: Observable<any>;

	@Select(ChatState.histroy)
	showhistroy$: Observable<any>;

	@ViewChild('dot') dot: ElementRef;
	@ViewChild('menuTemp') tmp: TemplateRef<any>;

	@ViewChild('hellobox') hellobox: ElementRef;
	@ViewChild('box') box: ElementRef;

	@ViewChild('showbox') showbox: ElementRef;

	@Input()
	file: File;

	histroy = [];

	showRoomList$ = this.dialog.list$;

	ischeck = true;

	// 上传图片的进度
	p = '0%';
	isShowReportProgress = false;

	// 是否拉黑
	isBlack = false;

	compareDay$ = new BehaviorSubject(new Date().getTime());

	isButtom$ = combineLatest([this.dialog.isButtom$, this.route.queryParams]).subscribe(([is, p]) => {
		if (is && p.r) {
			this.scrollToBottom();
			this.cdr.markForCheck();
		}
	});

	noMoreHistroy$ = this.dialog.noMoreHistroy$;

	constructor(
		private dialog: ChatStartService,
		private router: Router,
		private route: ActivatedRoute,
		private store: Store,
		private http: HttpClient,
		private cdr: ChangeDetectorRef,
		private zoom: ZoomService,
		private toast: Toast,
		private modal: ModalService,
		private menu: DropDownService,
		private vc: ViewContainerRef,
		private scrollDispatcher: ScrollDispatcher
	) {}

	now$ = this.route.queryParams;

	ngOnInit(): void {
		combineLatest([this.route.queryParams, this.route.data])
			.pipe(
				tap(([params, chat]) => {
					this.dialog.list$.next(chat.chat);
					this.dialog.roomList = chat.chat;
					if (params.r) {
						this.getHistroy(params.r, 1);
						this.ischeck = true;
						this.black(params.i);
						this.dialog.alreadyRead([params.r]);
					} else {
						if (chat.chat.length > 0) {
							this.router.navigate([], {
								queryParams: {
									i: chat.chat[0]?.sender_id,
									n: chat.chat[0]?.sender_nickname,
									a: chat.chat[0]?.sender_avatar,
									r: chat.chat[0]?.roomid,
								},
							});
						} else {
							this.ischeck = false;
						}
					}
				})
			)
			.subscribe();
	}

	getMoreList(event: Event): void {
		// this.scrollDispatcher.scrolled().pipe(
		//   tap(scrollable => {
		//     if (scrollable) {
		//       const scroll = scrollable as CdkScrollable;
		//       console.log('small' + scroll.measureScrollOffset('top'));
		//       if (scroll.measureScrollOffset('top') <= 0) {
		//         this.dialog.getList();
		//       }
		//     }
		//   })
		// ).subscribe();
		event.stopPropagation();
		if (this.showbox.nativeElement.scrollTop + this.showbox.nativeElement.clientHeight == this.showbox.nativeElement.scrollHeight) {
			this.dialog.getList();
		}
	}

	scrollToBottom = () => {
		const timer = setInterval(() => {
			if (this.hellobox) {
				this.hellobox.nativeElement.scrollTop = this.box.nativeElement.clientHeight + 9000;
				clearInterval(timer);
			}
		}, 1);
	};

	select(id: number, avatar: string, nickname: string, roomid: string, readCount?: number): void {
		this.router.navigate([], {
			queryParams: {
				i: id,
				a: avatar,
				n: nickname,
				r: roomid,
			},
		});
		this.store.dispatch(new RemoveHistroyAll()).subscribe();
		if (readCount) {
			this.dialog.alreadyRead([roomid]);
		}
		this.black(id);
	}

	/**查看是否拉黑 */
	black(id: number): void {
		this.http.get<any>(`/user/get_user?i=${id}`).subscribe(s => {
			if (s.follow_state === 3) {
				this.isBlack = true;
			} else {
				this.isBlack = false;
			}
		});
	}

	onDrop(event: DragEvent, r: number, me: number, input: HTMLInputElement, el: ElementRef): void {
		event.preventDefault();
		event.stopPropagation();
		if (!this.file) {
			this.sendPic(event.dataTransfer.files[0], r, me, input, el);
		}
	}

	getHistroy(r: string, first?: number): void {
		this.dialog.getHistroy(r, first);
	}

	getmore(event: Event, r: string): void {
		event.stopPropagation();
		if (this.hellobox.nativeElement.scrollTop == 0) {
			this.dialog.getHistroy(r);
			this.hellobox.nativeElement.scrollTop = this.hellobox.nativeElement.scrollHeight - this.box.nativeElement.clientHeight;
		}
	}

	sendPic(event: any, r: number, me: number, input: HTMLInputElement, el: ElementRef): void {
		let filetype: number;
		if (event.type.split('image').length > 1) {
			filetype = 1;
			const form = new FormData();
			form.append('f', event);
			this.http
				.post<{ token: string; url: string }>('/common/upload_file', form, {
					reportProgress: true,
					observe: 'events',
				})
				.pipe(
					filter(ev => {
						switch (ev.type) {
							case HttpEventType.UploadProgress: {
								this.p = ((ev.loaded / ev.total) * 100).toFixed(0) + '%';
								console.log(this.p);
								this.isShowReportProgress = true;
								break;
							}
							case HttpEventType.Response: {
								return true;
							}
						}
						return false;
					}),
					map((res: HttpResponse<any>) => res.body)
				)
				.subscribe(s => {
					this.dialog.sendMessage(r, s.token, filetype, me, s.url);
					this.isShowReportProgress = false;
				});

			input.value = null;
		} else {
			this.modal.open(PopTips, ['目前只支持发送文字和图片', false]);
		}
	}

	send(r: number, v: HTMLTextAreaElement, t: number, me: number, e: any, el: ElementRef): void {
		e.preventDefault();

		if (v.value.trim()) {
			this.dialog.sendMessage(r, v.value, t, me);
			v.value = null;
		} else {
			this.toast.show('发送内容不能为空', {
				type: 'error',
				el,
				timeout: 1000,
			});
		}
	}

	close(ev: Event, id: string, item: any, i: number): void {
		ev?.stopPropagation();
		this.http
			.post('/chat/cover_room', {
				r: [id],
			})
			.subscribe(
				s => {
					this.dialog.closeRoom(id);

					this.showRoomList$.pipe(withLatestFrom(this.now$)).subscribe(([l, n]) => {
						if (Number(id) === Number(n.r)) {
							if (l.length > 0) {
								if (i < l.length && i > -1) {
									this.router.navigate([], {
										queryParams: {
											i: l[i]?.sender_id,
											n: l[i]?.sender_nickname,
											a: l[i]?.sender_avatar,
											r: l[i]?.roomid,
										},
									});
								} else if (i === l.length) {
									this.router.navigate([], {
										queryParams: {
											i: l[i - 1]?.sender_id,
											n: l[i - 1]?.sender_nickname,
											a: l[i - 1]?.sender_avatar,
											r: l[i - 1]?.roomid,
										},
									});
								}
							} else if (l.length === 0) {
								this.ischeck = false;
								this.router.navigate([], {
									queryParams: { a: 1 },
								});
							}
						}
					});
				},
				e => {
					console.log(e);
				}
			);
	}

	showDetail(data: string): void {
		this.zoom.open(IllustZoomModalComponent, {
			assets: [data],
			index: 0,
		});
	}

	ngOnDestroy(): void {
		this.dialog.changeTotalUnread();
	}

	openMenu(): void {
		this.menu.menu(this.dot, this.tmp, this.vc, 0, 10);
	}

	block(id: number): void {
		this.modal
			.open(PopTips, ['是否确定拉至黑名单？', true])
			.afterClosed()
			.subscribe(is => {
				this.menu.close();
				if (is) {
					this.http.get(`/user/black?u=${id}`).subscribe(
						s => {
							this.isBlack = true;
						},
						e => {
							if (e.code === 702) {
								this.modal.open(PopTips, ['拉黑人数已超上限，无法拉黑。', false]);
							}
						}
					);
				}
			});
	}

	toUser(isHim: boolean, id: number): void {
		if (isHim) {
			this.router.navigate(['user', id]);
		}
	}
}

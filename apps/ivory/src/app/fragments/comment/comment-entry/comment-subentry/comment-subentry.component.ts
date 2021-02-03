import {
	Component,
	EventEmitter,
	ChangeDetectorRef,
	ViewContainerRef,
	ViewChild,
	ElementRef,
	TemplateRef,
	Renderer2,
	Input,
	Output,
	AfterContentInit,
} from '@angular/core';
import { ModelSubComment } from '../../model';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DropDownService, ModalService, UserState } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { CommentReportModalComponent } from '@peacha-core/components';
import { CommentApiService } from '../../comment-api.service';


@Component({
	selector: 'ivo-comment-subentry',
	templateUrl: './comment-subentry.component.html',
	styleUrls: ['./comment-subentry.component.less']
})
export class CommentSubentryComponent implements AfterContentInit {
	@ViewChild('dot') dot: ElementRef;
	@ViewChild('menuTemp') tmp: TemplateRef<any>;
	@ViewChild('subShow') subShow: HTMLDivElement;

	@Select(UserState.id)
	id$: Observable<number>;

	@Input() comment: ModelSubComment | undefined;

	@Output() toggleReply: EventEmitter<ModelSubComment> = new EventEmitter();

	constructor(
		private element: ElementRef,
		private http: HttpClient,
		private cdr: ChangeDetectorRef,
		private modal: ModalService,
		private menu: DropDownService,
		private vc: ViewContainerRef,
		private render: Renderer2,
		private router: Router,
		private commentApi: CommentApiService
	) { }

	ngAfterContentInit() {
		const hash = location.hash;
		location.hash = '';
		location.hash = hash;
	}

	clickReply() {
		this.toggleReply.emit(this.comment);
	}

	like(id: number) {
		// this.http
		// 	.post('/comment/like', {
		// 		c: id,
		// 	})
		this.commentApi.commentLike(id)
			.subscribe(_s => {
				if (this.comment) {
					if (this.comment.is_like) {
						this.comment.is_like = 0;
						this.comment.like_count--;
					} else {
						this.comment.is_like = 1;
						this.comment.like_count++;
					}
				}

				this.cdr.markForCheck();
			});
	}

	deleteSub(id: number) {
		this.modal
			.open(PopTips, ['确定要删除该评论吗？', true])
			.afterClosed()
			.subscribe(s => {
				if (s) {
					// this.http
					// 	.post('/comment/delete_sub', {
					// 		c: id,
					// 	})

					this.commentApi.commentDeleteSub(id)
						.subscribe(_ => {
							this.comment = undefined;
							this.cdr.markForCheck();
						});
				}
			});
	}

	open() {
		this.menu.menu(this.dot, this.tmp, this.vc, 0, 10);
	}
	report(id: number) {
		this.modal.open(CommentReportModalComponent, id);
	}

	show(el: ElementRef) {
		this.render.setStyle(el, 'opacity', 1);
	}

	hide(el: ElementRef) {
		this.render.setStyle(el, 'opacity', 0);
	}

	toUser(id: number) {
		this.router.navigate(['user', id]);
		document.documentElement.scrollTop = 0;
	}
}

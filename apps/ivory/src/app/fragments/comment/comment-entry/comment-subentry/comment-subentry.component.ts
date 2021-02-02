import {
	Component,
	EventEmitter,
	ChangeDetectorRef,
	OnDestroy,
	ViewContainerRef,
	ViewChild,
	ElementRef,
	TemplateRef,
	Renderer2,
	AfterViewInit,
	AfterContentChecked,
} from '@angular/core';
import { ModelSubComment } from '../../model';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { UserState } from '@peacha-core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';
import { DropDownService } from 'libs/peacha-core/src/lib/core/service/dropdown.service';
import { ModalService } from 'libs/peacha-core/src/lib/core/service/modals.service';
import { CommentReportModalComponent } from 'libs/peacha-core/src/lib/components/comment-report-modal/comment-report-modal-component';

@Component({
	selector: 'ivo-comment-subentry',
	templateUrl: './comment-subentry.component.html',
	styleUrls: ['./comment-subentry.component.less'],
	inputs: ['comment'],
	outputs: ['toggleReply'],
})
export class CommentSubentryComponent {
	@ViewChild('dot') dot: ElementRef;
	@ViewChild('menuTemp') tmp: TemplateRef<any>;
	@ViewChild('subShow') subShow: HTMLDivElement;

	@Select(UserState.id)
	id$: Observable<number>;

	constructor(
		private element: ElementRef,
		private http: HttpClient,
		private cdr: ChangeDetectorRef,
		private modal: ModalService,
		private menu: DropDownService,
		private vc: ViewContainerRef,
		private render: Renderer2,
		private router: Router
	) {}

	comment: ModelSubComment | undefined;

	toggleReply: EventEmitter<ModelSubComment> = new EventEmitter();

	ngAfterContentInit() {
		const hash = location.hash;
		location.hash = '';
		location.hash = hash;
	}

	clickReply() {
		this.toggleReply.emit(this.comment);
	}

	like(id: number) {
		this.http
			.post('/comment/like', {
				c: id,
			})
			.subscribe(s => {
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
					this.http
						.post('/comment/delete_sub', {
							c: id,
						})
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

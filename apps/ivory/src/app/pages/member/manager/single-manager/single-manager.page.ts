import { HttpClient } from '@angular/common/http';
import { Component, Input, ViewContainerRef, ElementRef, TemplateRef, Output, EventEmitter, Renderer2, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService, DropDownService } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { GoodsManagerPage } from '../goods-manager/goods-manager.page';

@Component({
	selector: 'ivo-single-manager',
	templateUrl: './single-manager.page.html',
	styleUrls: ['./single-manager.page.less'],
})
export class SingleManagerPage implements AfterViewInit {
	@ViewChild('dd') dd: ElementRef;
	/**
	 * type=1 插画
	 * type=0 live2d
	 *
	 * state=1 成功
	 * state=2 等待
	 * state=3 失败
	 */

	@Input() item: any;
	@Input() type: number;
	@Input() state: number;
	@Output()
	delete: EventEmitter<true> = new EventEmitter();

	constructor(
		private router: Router,
		private modal: ModalService,
		private http: HttpClient,
		private menu: DropDownService,
		private vc: ViewContainerRef,
		private render: Renderer2
	) { }

	ngAfterViewInit() {
		if (this.state == 1) {
			this.render.addClass(this.dd.nativeElement, 'default');
		}
	}

	open(a: ElementRef, b: TemplateRef<any>) {
		this.menu.menu(a, b, this.vc, 33, 5);
	}

	cancel(id: number) {
		this.modal
			.open(PopTips, ['确定撤销吗?', true])
			.afterClosed()
			.subscribe(s => {
				if (s) {
					this.http
						.post('/work/cannel_apply', {
							w: id,
						})
						.subscribe(_s => {
							this.delete.emit(true);
						});
				}
			});
	}

	edit(id: number) {
		this.menu.close();
		if (this.type === 1) {
			this.router.navigate(['/edit/illust', id]);
		} else if(this.type === 3){
			this.router.navigate(['/edit/illust/paid', id]);
		} 
		else if (this.type === 0) {
			this.router.navigate(['/edit/live2d', id]);
		} else if (this.type === 2) {
			this.router.navigate(['/edit/live2d/paid', id]);
		}
	}

	deleteWork(id: number) {
		this.menu.close();
		this.modal
			.open(PopTips, ['确定删除吗?', true])
			.afterClosed()
			.subscribe(s => {
				if (s) {
					this.http
						.post('/work/delete_work', {
							w: id,
						})
						.subscribe(_s => {
							this.delete.emit(true);
						});
				}
			});
	}

	deleteApply(id: number) {
		this.menu.close();
		this.modal
			.open(PopTips, ['确定删除吗?', true])
			.afterClosed()
			.subscribe(s => {
				if (s) {
					this.http
						.post('/work/delete_apply', {
							w: id,
						})
						.subscribe(_s => {
							this.delete.emit(true);
						});
				}
			});
	}

	manager(id: number, time: number) {
		this.menu.close();
		if (time + 7 * 24 * 60 * 60 * 1000 - Date.now() < 0) {
			this.modal.open(GoodsManagerPage, id);
		} else {
			this.modal.open(PopTips, ['商品正处于公示期，无法管理！', false]);
		}
	}

	toWork(id: number, c: number) {
		console.log(c);
		if (this.state == 1) {
			if (c == 1) {
				this.router.navigate(['illust', id]);
			} else {
				this.router.navigate(['live2d', id]);
			}
		}
	}
}

import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { UserState, ModalService, DropDownService, ChatStartService, OpalUser, dataURLtoBlob } from '@peacha-core';
import { CropBanner, PopTips, UserReportModalComponent } from '@peacha-core/components';
import { UpdateBanner } from '@peacha-core/state';



@Component({
	selector: 'ivo-user',
	templateUrl: './user.page.html',
	styleUrls: ['./user.page.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPage {
	@Select(UserState.id)
	id$: Observable<number>;

	@Select(UserState.banner)
	banner$: Observable<string>;

	@ViewChild('input') input: ElementRef;

	user$: Observable<OpalUser>;

	routerState = true;
	routerStateCode = 'active';
	userRole: Array<number> = [];
	params$ = this.route.queryParams;
	constructor(
		private route: ActivatedRoute,
		private store: Store,
		private modal: ModalService,
		private router: Router,
		private menu: DropDownService,
		private vc: ViewContainerRef,
		private chat: ChatStartService
	) {
		this.user$ = this.route.data.pipe(
			map(d => d.user),
			tap(i => {
				this.userRole = [];
				i.role.forEach(l => {
					this.userRole.push(l.id);
				});
			})
		);
	}

	testimg$ = new BehaviorSubject('');

	updateBanner(event: any, _input: ElementRef) {
		const imgtype = event.target.files[0].name.toLowerCase().split('.');
		const a = imgtype.findIndex(l => l == 'png');
		const b = imgtype.findIndex(l => l == 'jpg');
		const c = imgtype.findIndex(l => l == 'jpeg');
		if (a > 0 || b > 0 || c > 0) {
			if (event.target.files[0].size <= 1024 * 1024 * 5) {
				this.modal
					.open(CropBanner, event.target.files[0])
					.afterClosed()
					.subscribe(img => {
						if (img) {
							this.store.dispatch(new UpdateBanner(dataURLtoBlob(img))).subscribe(_s => {
								this.input.nativeElement.value = null;
								this.modal.open(PopTips, ['修改成功', false, 1]);
							});
						} else {
							this.input.nativeElement.value = null;
						}
					});
			} else {
				this.modal.open(PopTips, ['你上传的图片尺寸过大！最大为5M', false]);
			}
		} else {
			this.modal.open(PopTips, ['图片格式不正确，背景图仅支持.png,.jpg,.jpeg', false]);
		}
	}

	toReport(a: ElementRef, b: TemplateRef<any>) {
		this.menu.menu(a, b, this.vc);
	}

	report(id: number) {
		this.modal.open(UserReportModalComponent, id);
		this.menu.close();
	}

	toDialog(id: number, nickname: string, avatar: string) {
		this.id$.subscribe(i => {
			this.chat.openNewRoom(id, i, nickname, avatar);
		});

		//    this.router.navigate(['/message/dialog'],{
		//        queryParams:{
		//            i:id,
		//            n:nickname,
		//            a:avatar
		//        }
		//    })
	}
}

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { UserState, ModalService } from '@peacha-core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';
import { Observable } from 'rxjs';
import { take, switchMap, map } from 'rxjs/operators';

@Injectable()
export class CreaterCertificationGuard implements CanActivate {
	@Select(UserState.identity_state)
	identityState$: Observable<number>;

	constructor(private modal: ModalService, private router: Router) {}
	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
		return this.identityState$.pipe(
			switchMap(identityState =>
				identityState !== 2
					? this.modal
							.open(PopTips, ['创作者认证需要通过实名认证，\n您还未进行实名认证', 2, 0, '前去认证'])
							.afterClosed()
							.pipe(
								take(1),
								map(res => {
									if (res) {
										this.router.navigate(['/passport', 'authenticate']);
									}
									return !!res;
								})
							)
					: this.modal
							.open(PopTips, [
								'请注意，进行认证需要您存在至少3个已上传的对应类别作品，并提供符合要求的工作文件截图\n' +
									'并且，若经核实存在认证作品造假的情况，我们将收回认证，并永久拒绝该账号的创作者认证',
								1,
								0,
								'前去认证',
							])
							.afterClosed()
							.pipe(
								take(1),
								map(res => !!res)
							)
			)
		);
	}
}

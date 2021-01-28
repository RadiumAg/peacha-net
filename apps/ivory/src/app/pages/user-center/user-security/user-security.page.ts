import { Component } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { UserState, Role, ModalService, RoleApiService } from '@peacha-core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';
import { UserStateModel } from 'libs/peacha-core/src/lib/core/state/user.state';

@Component({
  selector: 'ivo-user-security',
  templateUrl: './user-security.page.html',
  styleUrls: ['./user-security.page.less'],
})
export class UserSecurityPage {
  @Select(UserState.state)
  user$: Observable<UserStateModel>;

  @Select(UserState.identity_state)
  identity_state$: Observable<number>;

  artistRoleState$ = this.roleApi.findApply(Role.Artist);
  modelerRoleState$ = this.roleApi.findApply(Role.Modeler);

  constructor(
    public store: Store,
    private router: Router,
    private modal: ModalService,
    private roleApi: RoleApiService
  ) {}

  changePhone(email: string) {
    if (email) {
      this.router.navigate(['/passport/bind_phone']);
    } else {
      this.modal.open(PopTips, ['请先绑定邮箱后再换绑手机', false]);
    }
  }

  changeEmail(phone: string) {
    if (phone) {
      this.router.navigate(['/passport/bind_email']);
    } else {
      this.modal.open(PopTips, ['请先绑定手机后再换绑邮箱', false]);
    }
  }
}

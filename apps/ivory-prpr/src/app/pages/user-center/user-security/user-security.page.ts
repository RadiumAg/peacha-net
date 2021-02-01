import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { OpalUser } from 'src/app/core/model/user';
import { Observable } from 'rxjs';
import { UserState } from 'src/app/core';
import { UserStateModel } from 'src/app/core/state/user.state';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Router } from '@angular/router';
import { ModalService } from 'src/app/core/service/modals.service';
import { PopTips } from 'src/app/components/pop-tips/pop-tips';

@Component({
  selector: 'ivo-user-security',
  templateUrl: './user-security.page.html',
  styleUrls: ['./user-security.page.less']
})
export class UserSecurityPage {

  @Select(UserState.state)
  user$: Observable<UserStateModel>;

  @Select(UserState.identity_state)
  identity_state$: Observable<number>;

  constructor(public store: Store, private router: Router, private modal: ModalService) { }

  changePhone(email: string) {
    if (email) {
      this.router.navigate(['/passport/bind_phone'])
    } else {
      this.modal.open(PopTips, ['请先绑定邮箱后再换绑手机', false])
    }
  }

  changeEmail(phone:string){
   if(phone){
    this.router.navigate(['/passport/bind_email'])
   }else{
    this.modal.open(PopTips, ['请先绑定手机后再换绑邮箱', false])
   }
  }

}

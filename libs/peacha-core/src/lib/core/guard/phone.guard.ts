import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { PopTips } from '../../components/pop-tips/pop-tips';
import { ModalService } from '../service/modals.service';
import { UserState } from '../state/user.state';

@Injectable({
  providedIn: 'root',
})
export class PhoneGuard implements CanActivate {
  @Select(UserState.phone)
  phone$: Observable<string>;

  constructor(private router: Router, private modal: ModalService) { }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.phone$.pipe(
      map(phone => {
        if (phone) {
          return true;
        } else {
          this.modal
            .open(PopTips, ['依据《网络安全法》，为了保障您的账户安全和正常使用，请完成手机绑定。', 1, 2, '前往绑定'])
            .afterClosed()
            .pipe(take(1))
            .subscribe(sure => {
              if (sure) {
                this.router.navigate(['/passport/bind_phone']);
              }
            });
          return false;
        }
      })
    );
  }
}

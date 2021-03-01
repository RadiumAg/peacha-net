import { PopTips } from './../../components/pop-tips/pop-tips';
import { Injectable } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserApiService } from '../service/user-api-services';
import { ModalService } from '../service/modals.service';

@Injectable({
  providedIn: 'root'
})
export class UserBanStatusGuard implements CanActivate {
  constructor(private userApi: UserApiService, private modal: ModalService) { }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.userApi.banStatus().pipe(
      map(x => {
        if (x.status) {
          this.modal.open(PopTips, ['该账号已被封禁'])
            .afterClosed().subscribe();
        }
        return !x.status;
      }));
  }
}

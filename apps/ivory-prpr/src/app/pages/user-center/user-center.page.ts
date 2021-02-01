import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserState } from '../../core/state/user.state';

@Component({
  selector: 'ivo-user-center',
  templateUrl: './user-center.page.html',
  styleUrls: ['./user-center.page.less']
})
export class UserCenterPage implements OnInit {
  @Select(UserState.avatar)
  avatar$: Observable<string>;

  @Select(UserState.nickname)
  nickname$: Observable<string>;

  @Select(UserState.description)
  description$: Observable<string>;

  constructor() { }

  ngOnInit(): void {
  }

}

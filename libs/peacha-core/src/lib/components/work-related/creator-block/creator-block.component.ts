import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserState } from '../../../core';
import { ChatStartService } from '../../../core/service/chat.service';
@Component({
  selector: 'ivo-creator-block',
  templateUrl: './creator-block.component.html',
  styleUrls: ['./creator-block.component.less'],
})
export class CreatorBlockComponent {
  @Select(UserState.id)
  id$: Observable<number>;

  @Input() userName: string;
  @Input() userId: number;
  @Input() userAvatar: string;
  @Input() followState: number;
  @Input() role: Array<number>;

  constructor(private router: Router, private chat: ChatStartService) {}

  click() {
    this.router.navigateByUrl('/user/' + this.userId);
  }

  toDialog(id: number, nickname: string, avatar: string) {
    this.id$.subscribe((i) => {
      this.chat.openNewRoom(id, i, nickname, avatar);
    });
  }
}

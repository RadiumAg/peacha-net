import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ModalService } from '@peacha-core';
import { PopTips } from '@peacha-core/components';

@Component({
  selector: 'ivo-single-card',
  templateUrl: './single-card.html',
  styleUrls: ['./single-card.less']
})
export class SingleCard implements OnInit {

  @Input() item: any;
  /**
   *0：卡片有box-shadow；1：卡片有border-bottom
   *
   * @type {number}
   * @memberof SingleCard
   */
  @Input() style: number;

  detail: any;
  avatar: string;

  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private modal: ModalService) { }

  ngOnInit(): void {
    this.detail = JSON.parse(this.item.content);
    if (this.detail?.sp?.h) {
      this.http.get<{
        avatar: string,
        banner: string,
        collect_count: number,
        description: string,
        follow_state: number,
        id: number,
        like_count: number,
        nickname: string,
        num_followed: number,
        num_following: number,
        role: { id: number, expiry: number }[]
      }>(`/user/get_user?i=${this.detail?.sp?.h[0]}`).subscribe(s => {
        this.avatar = s.avatar;
        this.cdr.detectChanges();
      });
    }
  }

  toDetail(l: string): void {


    if (l != undefined) {
      if (l.split('commentid=').length > 1) {

        this.http.get<{ rootid: number; root_index: number; sub_index: number }>(`/comment/reply_jump?c=${l.split('commentid=')[1]}`).subscribe(s => {
          if (s.root_index != -1) {
            window.open(`${l}&root=${s.root_index}&sub=${s.sub_index}&rootid=${s.rootid}#${'reply' + l.split('commentid=')[1]}`);
          } else {
            this.modal.open(PopTips, ['该评论不存在', false]);
          }
        });
      } else {
        window.open(l);
      }

    }
  }

}

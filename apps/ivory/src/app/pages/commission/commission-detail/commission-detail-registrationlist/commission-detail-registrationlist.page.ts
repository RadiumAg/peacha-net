import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { UserState, ModalService, ChatStartService } from '@peacha-core';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { CommissionApiService } from '../../service/commission-api.service';
import { CommissionDetailService } from '../../service/detail.service';
import { CommissionPainter } from '../commission-pop-component/commission-painter/commission-painter';

@Component({
  selector: 'ivo-commission-detail-registrationlist',
  templateUrl: './commission-detail-registrationlist.page.html',
  styleUrls: ['./commission-detail-registrationlist.page.less'],
})
export class CommissionDetailRegistrationlistPage implements OnInit {
  @Select(UserState.id)
  id$: Observable<number>;

  identity: number;

  list: {
    count: number;
    list: {
      userId: number;
      nickName: string;
      avatar: string;
      detail: {
        startTime: number;
        price: number;
        day: number;
        description: string;
      };
      workList?: {
        id: number;
        cover: string;
        category: number;
      }[];
    }[];
  };

  currentPage = 0;

  rlist$ = this.route.queryParams.pipe(
    tap((i) => {
      if (i.page) {
        this.currentPage = i.page;
      } else {
        this.currentPage = 1;
      }
    }),
    switchMap((p) => {
      return this.commissionApi
        .registrationList(p.id, p.page ? p.page - 1 : 0, p.s ?? 4)
        .pipe(
          tap((s) => {
            this.list = s;
            /**请求报名列表的作品列表 */
            if (s.count > 0) {
              const idList = [];
              s?.list.map((i) => idList.push(i.userId));
              this.getWorkList(idList);
            }
          })
        );
    })
  );

  constructor(
    private detail: CommissionDetailService,
    private modal: ModalService,
    private commissionApi: CommissionApiService,
    private route: ActivatedRoute,
    private router: Router,
    private chat: ChatStartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.identity = this.detail.getIdentity();
  }

  select(
    nick: string,
    price: number,
    day: number,
    start: number,
    avatar: string,
    userid: number
  ): void {
    this.modal
      .open(CommissionPainter, {
        type: 0,
        price,
        day,
        nickname: nick,
        start,
        avatar,
        category: this.detail.getDetailValue().commission.category,
      })
      .afterClosed()
      .subscribe((i) => {
        if (i) {
          this.commissionApi
            .selectUser(userid, this.detail.getCommissionId())
            .subscribe((_) => {
              this.commissionApi
                .commissionStatus(this.detail.getCommissionId())
                .subscribe((s) => {
                  this.detail.commissionStatus$.next(s.status);
                });
              this.router.navigate(['/commission/detail/node'], {
                queryParams: {
                  id: this.detail.getCommissionId(),
                  receiverid: userid, // 选择用户后，用于刷新企划详情左边部分显示
                  status: 1,
                  money: price,
                },
              });
            });
        }
      });
  }

  /**搜索报名画师的作品 */
  getWorkList(work: Array<number>): void {
    this.commissionApi.userWorks(work.join(',')).subscribe((w) => {
      w.list.map((worklist) => {
        const index = this.list.list.findIndex(
          (i) => i.userId == worklist.userid
        );
        this.list.list[index].workList = worklist.list;
        this.cdr.detectChanges();
      });
    });
  }

  toPage(p: number): void {
    this.router.navigate([], {
      queryParams: {
        page: p,
      },
      queryParamsHandling: 'merge',
    });
  }

  toChat(id: number, avatar: string, nickname: string): void {
    this.id$.subscribe((i) => {
      this.chat.openNewRoom(id, i, nickname, avatar);
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'ivo-record-detail',
  templateUrl: './record-detail.page.html',
  styleUrls: ['./record-detail.page.less']
})
export class RecordDetailPage {

  constructor(
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute,
  ) { }


  order$ = this.route.queryParams.pipe(
    switchMap(r => {
      return this.http.get<any>(`/mall/get_sell_order_detail?o=${r.id}`)
    })
  )


  toWork(id: number, c: number) {
    if (c == 1) {
      this.router.navigate(['illust', id])
    } else {
      this.router.navigate(['live2d', id])
    }
  }

  goback() {
    this.route.queryParams.subscribe(s => {
      if (s.jk) {
        this.router.navigate(['/member/record'])
      } else {
        history.go(-1)
      }
    })

  }

}

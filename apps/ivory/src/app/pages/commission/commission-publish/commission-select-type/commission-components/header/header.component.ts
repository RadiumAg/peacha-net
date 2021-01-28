import { ActivatedRoute } from '@angular/router';
import { Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SelectData } from '@peacha-core';
import { SELECT_DATA_TOKEN } from 'libs/peacha-core/src/lib/core/tokens';

@Component({
  selector: 'ivo-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less'],
})
export class HeaderComponent implements OnInit {
  title: string[];
  constructor(
    private router: ActivatedRoute,
    @Inject(SELECT_DATA_TOKEN)
    public select_data_token: BehaviorSubject<SelectData>
  ) {
    this.router.data.subscribe((x: { header_title: string[] }) => {
      this.title = x.header_title;
    });
  }

  ngOnInit() {}
}

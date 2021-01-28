import { BehaviorSubject } from 'rxjs';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectData } from '@peacha-core';
import {
  SELECT_TOKEN,
  SELECT_DATA_TOKEN,
} from 'libs/peacha-core/src/lib/core/tokens';

@Component({
  selector: 'ivo-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.less'],
})
export class FooterComponent implements OnInit {
  constructor(
    private router: ActivatedRoute,
    @Inject(SELECT_TOKEN) public select_token: BehaviorSubject<boolean>,
    @Inject(SELECT_DATA_TOKEN)
    public select_data_token: BehaviorSubject<SelectData>
  ) {}

  ngOnInit() {}
}

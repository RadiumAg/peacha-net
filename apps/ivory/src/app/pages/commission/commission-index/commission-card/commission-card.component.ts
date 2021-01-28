import { Commission } from './../../model/commission';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ivo-commission-card',
  templateUrl: './commission-card.component.html',
  styleUrls: ['./commission-card.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommissionCardComponent implements OnInit {
  @Input()
  commission: Commission;
  constructor(private router: Router) {}
  specialTime: number;

  ngOnInit(): void {
    if (this.commission.status === 0) {
      this.specialTime =
        Number(this.commission.updateTime) +
        Number(this.commission.day) * 24 * 60 * 60 * 1000;
    } else if (this.commission.status === 2) {
    }
  }

  toWork(id: number, status: number, event: any): void {
    event.stopPropagation();
    this.router.navigate(['/commission/detail/node'], {
      queryParams: {
        id,
        status,
      },
    });
  }
}

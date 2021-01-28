import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalRef } from '@peacha-core';

@Component({
  selector: 'ivo-no-result',
  templateUrl: './no-result.html',
  styleUrls: ['./no-result.less'],
})
export class NoResult {
  constructor(private router: Router, private modalRef: ModalRef<NoResult>) {}

  to() {
    this.router.navigate(['/setting/order']);
    this.modalRef.close();
  }
}

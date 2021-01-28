import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalRef } from 'libs/peacha-core/src/lib/core/service/modals.service';

@Component({
  selector: 'ivo-submit-success',
  templateUrl: './submit-success.html',
  styleUrls: ['./submit-success.less'],
})
export class SubmitSuccess {
  constructor(
    private router: Router,
    private modalRef: ModalRef<SubmitSuccess>
  ) {}
  sure() {
    this.modalRef.close();
    this.router.navigate(['/setting/wallet']);
  }
}

import { MODAL_DATA_TOKEN,ModalRef } from '@peacha-core';
import { Component,Inject,OnInit } from '@angular/core';

@Component({
  selector: 'ivo-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.less']
})
export class ConfirmComponent implements OnInit {

  constructor(@Inject(MODAL_DATA_TOKEN) private modalRef: ModalRef<boolean>) { }

  headerTitle = '';
  tipText = '';
  sureButtonText = '再次编辑';
  cancelButtonText = '确认发布';
  icon = 'warn';

  ngOnInit(): void {
    this.modalRef[0] && (this.tipText = this.modalRef[0]);
    this.modalRef[1] && (this.headerTitle = this.modalRef[1]);
    this.modalRef[2] && (this.sureButtonText = this.modalRef[2]);
    this.modalRef[3] && (this.cancelButtonText = this.modalRef[3]);
    this.modalRef[4] && (this.icon = this.modalRef[4]);
  }

  sure() {
    this.modalRef.close(true);
  }

  cancel() {
    this.modalRef.close(false);
  }

}

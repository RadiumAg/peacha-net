import { MODAL_DATA_TOKEN,ModalRef } from '@peacha-core';
import { Component,Inject,OnInit } from '@angular/core';

@Component({
  selector: 'ivo-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.less']
})
export class ConfirmComponent implements OnInit {

  constructor(@Inject(MODAL_DATA_TOKEN) private data: [string,string,string,string,string],private modalRef: ModalRef<ConfirmComponent>) { }

  headerTitle = '';
  tipText = '';
  sureButtonText = '再次编辑';
  cancelButtonText = '确认发布';
  icon = 'warn';

  sure() {
    this.modalRef.close(true);
  }

  cancel() {
    this.modalRef.close(false);
  }


  ngOnInit(): void {
    this.data[0] && (this.tipText = this.data[0]);
    this.data[1] && (this.headerTitle = this.data[1]);
    this.data[2] && (this.sureButtonText = this.data[2]);
    this.data[3] && (this.cancelButtonText = this.data[3]);
    this.data[4] && (this.icon = this.data[4]);
  }

}

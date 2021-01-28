import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalRef } from '@peacha-core';
import { MODAL_DATA_TOKEN } from 'libs/peacha-core/src/lib/core/tokens';

@Component({
  selector: 'ivo-delete-tip',
  templateUrl: './delete-tip.html',
  styleUrls: ['./delete-tip.less'],
})
export class DeleteTip {
  constructor(
    private modalRef: ModalRef<DeleteTip>,
    @Inject(MODAL_DATA_TOKEN) public collectionId: number,
    private http: HttpClient
  ) {}

  deleteCollection() {
    return this.http
      .post<void>('/work/delete_collection', {
        c: this.collectionId,
      })
      .subscribe((_) => {
        this.modalRef.close();
        window.history.back();
      });
  }

  sure() {
    this.modalRef.close();
  }
}

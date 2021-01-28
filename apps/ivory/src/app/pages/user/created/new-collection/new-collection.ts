import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap, switchMap, take } from 'rxjs/operators';
import { ModalRef } from '@peacha-core';

@Component({
  selector: 'ivo-new-collection',
  templateUrl: './new-collection.html',
  styleUrls: ['./new-collection.less'],
})
export class NewCollection {
  @ViewChild('input') name: ElementRef;

  isshow$ = new BehaviorSubject<number>(0);
  nameLength$ = new BehaviorSubject<number>(0);

  constructor(
    private http: HttpClient,
    private modalRef: ModalRef<NewCollection>
  ) {}

  onInput(event: string) {
    this.nameLength$.next(event.length);
  }

  show() {
    this.isshow$
      .pipe(
        take(1),
        tap((is) => {
          if (is == 0) {
            this.isshow$.next(1);
          } else {
            this.isshow$.next(0);
          }
        })
      )
      .subscribe();
  }

  cancel() {
    this.modalRef.close();
  }

  sure() {
    this.isshow$
      .pipe(
        take(1),
        switchMap((is) => {
          return this.http.post('/work/create_collection', {
            s: this.name.nativeElement.value,
            v: is,
          });
        })
      )
      .subscribe((_) => {
        this.modalRef.close();
      });
  }
}

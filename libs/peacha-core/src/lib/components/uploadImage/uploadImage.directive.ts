import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { filter, map } from 'rxjs/operators';

@Directive({
  selector: '[uploadImage]',
  exportAs: ' uploadimage',
})
export class UploadImageDirective {
  @Input() event: any;
  @Output() result = new EventEmitter();

  constructor(private http: HttpClient) {}

  upload(event: any) {
    const form = new FormData();
    form.append('f', event);
    this.http
      .post<{ token: string; url: string }>('/common/upload_file', form, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        filter((event) => {
          switch (event.type) {
            case HttpEventType.UploadProgress: {
              this.result.emit(
                ((event.loaded / event.total) * 100).toFixed(0) + '%'
              );
              break;
            }
            case HttpEventType.Response: {
              return true;
            }
          }
          return false;
        }),
        map((res: HttpResponse<any>) => res.body)
      )
      .subscribe((res) => {
        if (res) {
          this.result.emit(res);
        }
      });
  }
}

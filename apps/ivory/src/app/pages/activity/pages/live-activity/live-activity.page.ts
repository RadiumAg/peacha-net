import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { OpalUser, Work } from '@peacha-core';
import { HttpVirtualFileSystem, Live2dTransformData, ReadableVirtualFileSystem } from '@peacha-studio-core';
import { tap } from 'ramda';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  selector: 'ivo-live-activity',
  templateUrl: './live-activity.page.html',
  styleUrls: ['./live-activity.page.less']
})
export class LiveActivityPage {

  constructor(
    private http: HttpClient,
    // private workApi: WorkApiService
  ) { }

  // user$ = this.http.get<OpalUser>(`/user/get_user?i=21437`).subscribe(s => {
  //   console.warn(s)
  // });

  live2d$: Observable<ReadableVirtualFileSystem>;
  transformData: Live2dTransformData;
  enableFaceTracker: boolean;
  enableSettingPanel: boolean;

  user$ = this.http.get<OpalUser>(`/user/get_user?i=21437`);

  // work$ = this.http.get<any>(`/work/get_work?w=10961`).subscribe(S => {

  // });
  work$ = this.http.get<Work>(`/work/get_work?w=10961`).pipe(
    map(s => {
      this.live2d$ = of(new HttpVirtualFileSystem(s.file));
      const previewData = s.file_data ? JSON.parse(s.file_data) : null;
      this.transformData = previewData?.transformData as Live2dTransformData;
      this.enableFaceTracker = previewData?.enableFaceTracker;
      this.enableSettingPanel = previewData?.enableSettingPanel;
    })
  );



}

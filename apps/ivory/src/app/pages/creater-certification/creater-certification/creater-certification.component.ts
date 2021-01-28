import {
  Component,
  ViewChildren,
  QueryList,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { take, map, takeWhile, tap } from 'rxjs/operators';
import { BehaviorSubject, pipe, Observable } from 'rxjs';
import {
  ScreenshotComponent,
  UploadImage,
} from '../components/screenshot/screenshot.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleApiService, ModalService, Role } from '@peacha-core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';
import { WorkSelectorComponent } from 'libs/peacha-core/src/lib/components/work-selector/work-selector.component';

@Component({
  templateUrl: './creater-certification.component.html',
  styleUrls: ['./creater-certification.component.less'],
})
export class CreaterCertificationComponent {
  constructor(
    private roleApi: RoleApiService,
    private route: ActivatedRoute,
    private modal: ModalService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  @ViewChildren(ScreenshotComponent)
  screenshotComponentList: QueryList<ScreenshotComponent>;

  applyWorkList$ = new BehaviorSubject(
    Array.from<{
      id: number;
      cover: string;
      screenshots: UploadImage[];
    }>({ length: 3 })
  );

  role$ = this.route.paramMap.pipe(map((params) => Number(params.get('role'))));

  applyRole(role: Role) {
    this.roleApi
      .applyRole({
        r: role,
        l: this.applyWorkList$.value.map((work) => ({
          w: work.id,
          f: work.screenshots.map((screenshot) => screenshot.token),
        })),
      })
      .pipe(take(1))
      .subscribe(() => {});
  }

  verify = {
    workVerify: (): boolean => {
      const currentValue = this.applyWorkList$.getValue();
      if (!currentValue.every((x) => x !== undefined)) {
        this.modal.open(PopTips, ['请选择至少三幅作品']).afterClosed();
        return false;
      }
      if (!currentValue.every((x) => x.screenshots.length !== 0)) {
        this.modal.open(PopTips, ['每个作品至少有一张截图']).afterClosed();
        return false;
      }
      return true;
    },
  };

  roleMapper(role: Role) {
    switch (role) {
      case 11001:
        return '模型师';
      case 11002:
        return '画师';
      default:
        throw new Error('unknown role');
    }
  }

  delete(shotIndex: number, workIndex: number) {
    const oldValue = this.applyWorkList$.getValue();
    oldValue[workIndex].screenshots.splice(shotIndex, 1);
    this.applyWorkList$.next(oldValue);
  }

  uploadCallback(e: UploadImage, index: number) {
    const oldValue = this.applyWorkList$.getValue();
    if (!oldValue[index]) {
      this.modal.open(PopTips, ['选择作品后才可以上传截图']).afterClosed();
      return;
    }
    // begin report, change the url and token
    e.reportProcess();
    oldValue[index].screenshots.push(e);
    this.applyWorkList$.next(oldValue);
  }

  selectWork(i: number) {
    const role = this.route.snapshot.paramMap.get('role');
    this.modal
      .open(WorkSelectorComponent, {
        type: role === '11002' ? 'ill' : role === '11001' ? 'live2d' : '',
        exclouds: this.applyWorkList$.value.map((l) => l?.id),
      })
      .afterClosed()
      .pipe(
        take(1),
        takeWhile((work) => work)
      )
      .subscribe({
        next: ({ id, cover }) => {
          this.applyWorkList$.next(
            this.applyWorkList$.value.map((work, index) =>
              i === index
                ? {
                    id,
                    cover,
                    screenshots: [],
                  }
                : work
            )
          );
        },
      });
  }

  progressCircularLeft(process: number): string {
    if (process < 0.5) {
      return 'rotate(' + (process * 360 + 180) + 'deg)';
    } else if (process >= 0.5) {
      return 'rotate(360deg)';
    } else {
      return 'rotate(180deg)';
    }
  }

  progressCircularRight(process: number): string {
    if (process > 0.5 && process <= 1) {
      return 'rotate(' + ((process - 0.5) * 360 + 180) + 'deg)';
    } else {
      return 'rotate(180deg)';
    }
  }

  submitForCertification() {
    if (!this.verify.workVerify()) {
      return;
    }
    let r;
    this.role$.subscribe((_) => {
      r = _;
    });
    this.roleApi
      .applyRole({
        r,
        l: this.applyWorkList$.getValue().map((x) => {
          return {
            w: x.id,
            f: x.screenshots.map((_) => _.token),
          };
        }),
      })
      .subscribe({
        next: (message) => {
          this.modal
            .open(PopTips, ['提交成功', , 1])
            .afterClosed()
            .subscribe(() => {
              this.router.navigate(['/setting/security']);
            });
        },
        error: (message) => {
          this.modal.open(PopTips, ['提交认证失败!,请稍后再试', , 0]);
        },
        complete: () => {},
      });
  }
}

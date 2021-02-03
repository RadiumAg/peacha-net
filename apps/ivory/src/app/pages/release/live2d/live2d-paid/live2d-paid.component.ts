import { map, tap, debounce } from 'rxjs/operators';
import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Live2dUploadComponent } from '../../components/live2d-upload/live2d-upload.component';
import { SuccessTips } from '../../components/success-tips/success-tips';
import { BehaviorSubject, fromEvent, interval } from 'rxjs';
import { ReleaseApiService } from '../../release-api.service';
import { ModalService, Work } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { emptyStringValidator, live2dPriceValidator, validator } from '@peacha-core';
import { Live2dTransformData } from '@peacha-studio-core';

@Component({
  selector: 'ivo-live2d-paid',
  templateUrl: './live2d-paid.component.html',
  styleUrls: ['./live2d-paid.component.less'],
})
export class Live2dPaidComponent implements OnInit, AfterViewInit {
  constructor(private fb: FormBuilder, private modal: ModalService, private route: ActivatedRoute, private api: ReleaseApiService) { }

  @ViewChild('submitButton')
  submitButton: ElementRef;
  @ViewChild(Live2dUploadComponent)
  live2dUpload: Live2dUploadComponent;
  @ViewChild('godds_live2d')
  goodsLivewdUpload: Live2dUploadComponent;
  Fixed = Number.prototype.toFixed;
  param: {
    n: string;
    d: string;
    a: number;
    b: string;
    g: string;
    gd: string;
    t: string;
    c: number;
    cs: number;
    ss: number;
    fr: number;
    f: [];
    gl: [];
  };
  form = this.fb.group({
    n: ['', [Validators.required, emptyStringValidator()]],
    d: ['', [Validators.required, emptyStringValidator()]],
    b: ['', Validators.required],
    g: ['', Validators.required],
    a: [[]],
    c: [false, Validators.requiredTrue],
    s: [-2, Validators.min(-1)],
    p: ['', live2dPriceValidator()],
    gl_token: ['', Validators.required],
    t: [[]],
    checked: [false, Validators.requiredTrue],
  });
  checkedForm = this.fb.group({
    enableFaceTrackerChecked: [false],
    enableSettingPanelChecked: [false],
    sSaleChecked: [false],
    dSaleChecked: [false],
    copyright: [[]],
    copychecked: [false],
  });
  saleDisabled = false;
  aCheckedOne = false;
  aCheckedTwo = false;
  aCheckedThree = false;
  aCheckedFour = false;
  enableFaceTrackerChecked = false;
  enableSettingPanelChecked = false;
  pInputDisabled = '';
  modelCheckedSet = false;
  transformData: Live2dTransformData;
  maxPrice = 99999;
  token: string;
  copyrightCheckes$ = new BehaviorSubject<{ id: number; name: string }[]>([]);
  copyrightModel = [];
  stateMentStates: boolean[];
  private modalSetting: {
    transformData: any;
    enableFaceTracker: boolean;
    enableSettingPanel: boolean;
  } = {
      transformData: {},
      enableFaceTracker: false,
      enableSettingPanel: false,
    };
  isEdit = false;
  stateMentStrategy = {
    ['fllow']: () => {
      this.stateMentStates = this.stateMentStates.map(x => true);
      this.resetAChecked();
    },
    ['orgin']: () => {
      this.stateMentStates = this.stateMentStates.map(x => false);
    },
    ['not_checked']: () => {
      this.stateMentStates = this.stateMentStates.map(x => true);
    },
  };
  call = (x: Function, y: any, ...args) => x.call(y, args);
  setSaleDisabledState(): void {
    if (this.form.value.gl_token) {
      this.saleDisabled = false;
      this.pInputDisabled = '';
    } else {
      this.saleDisabled = true;
      this.pInputDisabled = 'disabled';
      this.checkedForm.patchValue({
        sSaleChecked: false,
        dSaleChecked: false,
      });
    }

    // 商品出售方式不可修改
    // 2020/11/4
    // by kinori
    if (this.isEdit) {
      this.saleDisabled = true;
    }
  }

  onTransformDataUpdate(data: Live2dTransformData): void {
    this.transformData = data;
    this.form.patchValue({
      gd: JSON.stringify({
        transformData: { ...this.transformData },
        enableFaceTracker: this.modalSetting.enableFaceTracker,
        enableSettingPanel: this.modalSetting.enableSettingPanel,
      }),
    });
  }

  private resetAChecked(): void {
    this.checkedForm.patchValue({
      copychecked: false,
    });
  }

  /**
   * @description 验证
   */
  private validator(): boolean {
    let flag = true;

    if (!this.form.valid) {
      flag = false;
    }
    return flag;
  }

  changeCopyright($event: string[]): void {
    this.form.patchValue({
      a: $event,
    });
  }

  private getEditWorkData(): void {
    this.route.paramMap.subscribe(x => {
      if (x.get('id')) {
        this.isEdit = true;
        this.api.get_edit_work(Number(x.get('id'))).subscribe((r: Work) => {
          this.setMainForm(r);
          this.setModelChecked(r);
          this.goodsLivewdUpload.loadFileFromOpal(r.goods_list[0].file, null);
        });
      }
    });
  }

  private setModelChecked(r: Work): void {
    if (JSON.parse(r.file_data)) {
      const fileData = JSON.parse(r.file_data);
      this.checkedForm.patchValue({
        enableFaceTrackerChecked: fileData.enableFaceTracker || false,
        enableSettingPanelChecked: fileData.enableSettingPanel || false,
      });
      this.modalSet([fileData.enableFaceTracker ? '0' : '', fileData.enableSettingPanel ? '1' : '']);
    }
  }

  private setMainForm(r: Work): void {
    this.token = r.file;
    this.form.patchValue({
      n: r.name,
      d: r.description,
      b: { url: r.cover },
      t: r.tag,
      c: !r.copyright && true,
      g: this.token,
      a: r.authority,
      p: r.goods_list[0].price,
      s: r.goods_list[0].max_stock,
      gl_token: r.goods_list[0].file,
    });
    this.copyrightModel = r.authority;
    this.live2dUpload.loadFileFromOpal(r.file, r.file_data ? JSON.parse(r.file_data) : null);
  }

  private getCopyRight(): void {
    this.api.copyright(0).subscribe((x: { list: { name: string; id: number }[] }) => {
      this.copyrightCheckes$.next(x.list);
      this.setInitstateMentStates();
    });
  }

  private sure_edit(): void {
    const params = {
      w: this.route.snapshot.params.id,
      d: this.param.d,
      i: [],
      t: this.param.t,
      b: this.param.b,
      n: this.param.n,
      g: this.param.g,
      gl: this.param.gl,
      gd: this.param.gd,
      fr: this.param.fr,
      dg: [],
    };
    this.api.update_work(params).subscribe({
      next: () => {
        this.modal.open(SuccessTips, {
          redirectUrl: 'user',
          tip: '已成功提交审核，请等待后台人员审核!',
        });
      },
      error: (x: { descrption: string }) => {
        if (x.descrption) {
          this.modal.open(PopTips, [x.descrption]);
        } else {
          this.modal.open(PopTips, ['系统繁忙']);
        }
      },
    });
  }

  private public_work(): void {
    this.api.publish_work(this.param).subscribe({
      next: x => {
        this.modal.open(SuccessTips, {
          redirectUrl: '/member/manager/live2D/auditing',
          tip: '已成功提交审核，请等待后台人员审核！',
        });
      },
      error: (x: { descrption: string }) => {
        if (x.descrption) {
          this.modal.open(PopTips, [x.descrption, false, 0]);
        } else {
          this.modal.open(PopTips, ['系统繁忙', false, 0]);
        }
      },
    });
  }

  changeCopyrightState($event: boolean): void {
    if (!this.isEdit) {
      $event ? this.stateMentStrategy.orgin() : this.stateMentStrategy.not_checked();
    }
  }

  modalSet($event: string[]): void {
    this.modalSetting.enableFaceTracker = false;
    this.modalSetting.enableSettingPanel = false;
    $event.forEach(x => {
      switch (x) {
        case '0':
          this.modalSetting.enableFaceTracker = true;
          break;
        case '1':
          this.modalSetting.enableSettingPanel = true;
          break;
      }
    });

    const new_gd = {
      ...this.form.value.gd,
      enableFaceTracker: this.modalSetting.enableFaceTracker,
      enableSettingPanel: this.modalSetting.enableSettingPanel,
    };

    this.form.patchValue({ gd: new_gd });
  }

  openPDF(url: string): void {
    window.open(url);
  }

  submit(): void {
    validator(this.form, this.form.controls);
    if (!this.validator()) {
      return;
    }
    if (this.isEdit) {
      this.sure_edit();
    } else {
      this.public_work();
    }
  }

  private subscribeForm(): void {
    this.form.valueChanges
      .pipe(
        tap(value => {
          this.setModalCheckedDisabled();
          this.setSaleDisabledState();
        }),
        map((value: any) => {
          if (!this.isEdit) {
            value.gd = JSON.stringify({
              transformData: { ...this.transformData },
              enableFaceTracker: this.modalSetting.enableFaceTracker,
              enableSettingPanel: this.modalSetting.enableSettingPanel,
            });
            value.b = value.b.token || '';
            value.c = value.c ? 0 : '';
            if (value.gl_token) {
              value.gl = [
                {
                  n: '付费下载内容',
                  f: [value.gl_token],
                  p: value.p > this.maxPrice ? parseInt(((value.p + '').slice(0, (this.maxPrice + '').length)), 10) : value.p,
                  s: value.s,
                },
              ];
            }
            return {
              n: value.n,
              d: value.d,
              a: value.a,
              b: value.b,
              g: value.g,
              gd: value.gd,
              t: value.t.toString(),
              f: [],
              c: value.c,
              cs: 0,
              ss: value.ss,
              fr: 0,
              gl: value.gl,
            };
          } else {
            value.b = value.b.token || value.b.url;
            value.gd = JSON.stringify({
              transformData: { ...this.transformData },
              enableFaceTracker: this.modalSetting.enableFaceTracker,
              enableSettingPanel: this.modalSetting.enableSettingPanel,
            });
            console.log();
            value.c = value.c ? 0 : '';
            value.gl = [
              {
                n: '付费下载内容',
                f: [value.gl_token],
                p: value.p > this.maxPrice ? parseInt(((value.p + '').slice(0, (this.maxPrice + '').length)), 10) : value.p,
                s: value.s,
              },
            ];
            return {
              n: value.n,
              d: value.d,
              a: value.a,
              b: value.b,
              g: value.g,
              gd: value.gd,
              t: value.t.toString(),
              f: [],
              c: value.c,
              cs: 0,
              ss: 0,
              fr: 0,
              gl: value.gl,
            };
          }
        })
      )
      .subscribe((x: any) => {
        this.param = x;
      });
  }

  private setModalCheckedDisabled(): void {
    if (this.form.value.g) {
      this.modelCheckedSet = false;
    } else {
      this.modelCheckedSet = true;
      this.checkedForm.patchValue({
        enableFaceTrackerChecked: false,
        enableSettingPanelChecked: false,
      });
    }
  }

  private setInitstateMentStates(): void {
    this.copyrightCheckes$.subscribe(x => {
      this.stateMentStates = x.map(_ => true);
    });
  }

  private setChecked(): void {
    this.setModalCheckedDisabled();
    this.setSaleDisabledState();
  }

  ngOnInit(): void {
    this.getCopyRight();
    this.subscribeForm();
    this.getEditWorkData();
    this.setChecked();
  }

  ngAfterViewInit(): void {
    fromEvent(this.submitButton.nativeElement, 'click')
      .pipe(debounce(() => interval(500)))
      .subscribe(() => {
        this.submit();
      });
  }
}

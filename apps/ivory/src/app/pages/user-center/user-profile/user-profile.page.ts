import { Component, OnInit, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Store } from '@ngxs/store';
import { Toast, IvoryError } from '@peacha-core';
import {
  UpdateAvatar,
  UpdateNickname,
  UpdateDescription,
} from 'libs/peacha-core/src/lib/core/state/user.action';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'ivo-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.less'],
})
export class UserProfilePage implements OnInit {
  avatar: FormControl;
  nickName: FormControl;
  description: FormControl;

  avatar$: Observable<string>;
  nickname$ = new BehaviorSubject('');
  constructor(fb: FormBuilder, private store: Store, private toast: Toast) {
    this.avatar = fb.control(undefined);
    this.nickName = fb.control('', [
      Validators.required,
      Validators.maxLength(20),
      Validators.minLength(2),
      this.myPattern,
    ]);
    this.description = fb.control('', [Validators.maxLength(80)]);
    this.avatar$ = store.select((s) => s.user.avatar);
    this.avatar.valueChanges.subscribe((a) => {
      store.dispatch(new UpdateAvatar(a));
    });
  }
  des: FormControl = new FormControl();
  nn: FormControl = new FormControl();
  ngOnInit(): void {
    this.store
      .select((s) => {
        this.des.setValue(s.user.description);
        this.description.setValue(s.user.description);
        this.nickName.setValue(s.user.nickname);
        this.nn.setValue(s.user.nickname);
        this.nickname$.next(s.user.nickname);
      })
      .subscribe();
  }

  saveName(input: ElementRef) {
    // const s = input.getBoundingClientRect();

    if (this.nickName.valid && this.nickName.value != this.nn.value) {
      this.store.dispatch(new UpdateNickname(this.nickName.value)).subscribe(
        (s) => {
          this.toast.show('修改成功 ', {
            type: 'success',
            // origin: {
            //     clientX: s.left,
            //     clientY: s.bottom
            // },
            el: input,
            timeout: 1000,
          });
        },
        (e: IvoryError) => {
          if (e.code == 105) {
            this.toast.show('昵称重复 ', {
              type: 'error',
              // origin: {
              //     clientX: s.left,
              //     clientY: s.bottom
              // },
              el: input,
              timeout: 1000,
            });
            this.nickName.setValue(this.nickname$.value);
          } else if (e.code == 999) {
            console.log(e.code);
          }
        }
      );
    } else {
      // this.toast.show(JSON.stringify(this.nickName.errors),{
      if (this.nickName.hasError('maxlength')) {
        this.toast.show('昵称最长20个字符哦 ', {
          type: 'error',
          // origin: {
          //     clientX: s.left,
          //     clientY: s.bottom
          // },
          el: input,
          timeout: 1000,
        });
      } else if (this.nickName.hasError('required')) {
        this.toast.show('昵称不能为空 ', {
          type: 'error',
          // origin: {
          //     clientX: s.left,
          //     clientY: s.bottom
          // },
          el: input,
          timeout: 1000,
        });
      } else if (this.nickName.hasError('minlength')) {
        this.toast.show('昵称最短2个字符哦 ', {
          type: 'error',
          // origin: {
          //     clientX: s.left,
          //     clientY: s.bottom
          // },
          el: input,
          timeout: 1000,
        });
      } else if (this.nickName.hasError('myPattern')) {
        this.toast.show('不允许使用特殊字符 ', {
          type: 'error',
          // origin: {
          //     clientX: s.left,
          //     clientY: s.bottom
          // },
          el: input,
          timeout: 1000,
        });
      }
      // else{
      //     //console.log(this.nickName.errors)
      //     this.toast.show('昵称只能是文字哟 ', {
      //         type: 'error',
      //         origin: {
      //             clientX: s.left,
      //             clientY: s.bottom
      //         },
      //         timeout: 5000
      //     });
      // }

      this.nickName.setValue(this.store.selectSnapshot((s) => s.user.nickname));
    }
  }
  saveDesc(area: ElementRef) {
    // const des:FormControl=new FormControl((this.description.value as string).replace(/\s*/g, ''))
    if (this.description.valid && this.description.value != this.des.value) {
      //this.description.setValue((this.description.value as string).replace(/\s*/g, ''));
      this.store
        .dispatch(new UpdateDescription(this.description.value))
        .subscribe((s) => {
          this.toast.show('修改成功 ', {
            type: 'success',
            // origin: {
            //     clientX: s.left,
            //     clientY: s.bottom
            // },
            el: area,
            timeout: 1000,
          });
        });
    }
  }

  ngOnDestroy() {
    this.toast.close();
  }

  myPattern(control: AbstractControl) {
    const result = /^[_,\-,0-9,a-z,A-z,\u3040-\u30ff,\u31f0-\u31ff,\u1100-\u11ff,\u3400-\u4db5,\u4e00-\u9fa5,\u9fa6-\u9fbb,\uf900-\ufa2d,\ufa30-\ufa6a,\ufa70-\ufad9]+$/.test(
      control.value
    );
    return result ? null : { myPattern: { value: control.value } };
  }
}

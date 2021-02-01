
import { Component, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, PatternValidator, ValidatorFn, AbstractControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { UpdatePublicInformation, UpdateNickname, FetchMe, UpdateDescription, UpdateAvatar } from 'src/app/core/state/user.action';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Toast } from 'src/app/core';

@Component({
    selector: 'ivo-user-profile',
    templateUrl: './user-profile.page.html',
    styleUrls: ['./user-profile.page.less']
})
export class UserProfilePage implements OnInit {

    avatar: FormControl;
    nickName: FormControl;
    description: FormControl;

    avatar$: Observable<string>;
    nickname$: Observable<string>;
    constructor(fb: FormBuilder, private store: Store, http: HttpClient, private toast: Toast) {
        this.avatar = fb.control(undefined);
        this.nickName = fb.control('', [Validators.required, Validators.maxLength(10), Validators.minLength(2), Validators.pattern('^[^ ]+$'), this.myPattern]);
        this.description = fb.control('', [Validators.maxLength(80)]);
        this.avatar$ = store.select(s => s.user.avatar);
        this.avatar.valueChanges.subscribe(a => {
            store.dispatch(new UpdateAvatar(a));
        });
        this.nickname$ = store.select(s => s.user.nickname);
    }
    des: FormControl = new FormControl()
    nn: FormControl = new FormControl
    ngOnInit(): void {
        this.store.select(s => {
            this.des.setValue(s.user.description)
            this.description.setValue(s.user.description);
            this.nickName.setValue(s.user.nickname);
            this.nn.setValue(s.user.nickname);
        }).subscribe();


    }



    saveName(input: ElementRef) {
        // const s = input.getBoundingClientRect();

        if (this.nickName.valid && this.nickName.value != this.nn.value) {
            this.store.dispatch(new UpdateNickname(this.nickName.value)).subscribe(
                s => {

                },
                e => {
                    switch(e.code){
                        case 105:{
                            this.toast.show('昵称重复', {
                                type: 'error',
                                // origin: {
                                //     clientX: s.left,
                                //     clientY: s.bottom
                                // },
                                el: input,
                                timeout: 5000
                            });
                            break;
                        }
                    }
                }
            );
        } else {
            // this.toast.show(JSON.stringify(this.nickName.errors),{
            if (this.nickName.hasError('maxlength')) {
                this.toast.show('昵称最长10个字哦 ', {
                    type: 'error',
                    // origin: {
                    //     clientX: s.left,
                    //     clientY: s.bottom
                    // },
                    el: input,
                    timeout: 5000
                });
            }
            else if (this.nickName.hasError('required')) {
                this.toast.show('昵称不能为空 ', {
                    type: 'error',
                    // origin: {
                    //     clientX: s.left,
                    //     clientY: s.bottom
                    // },
                    el: input,
                    timeout: 5000
                });
            }
            else if (this.nickName.hasError('minlength')) {
                this.toast.show('昵称最短2个字哦 ', {
                    type: 'error',
                    // origin: {
                    //     clientX: s.left,
                    //     clientY: s.bottom
                    // },
                    el: input,
                    timeout: 5000
                });
            }
            else if (this.nickName.hasError("myPattern")) {
                this.toast.show('不允许使用特殊字符 ', {
                    type: 'error',
                    // origin: {
                    //     clientX: s.left,
                    //     clientY: s.bottom
                    // },
                    el: input,
                    timeout: 5000
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

            this.nickName.setValue(this.store.selectSnapshot(s => s.user.nickname));
        }

    }
    saveDesc() {
        // const des:FormControl=new FormControl((this.description.value as string).replace(/\s*/g, ''))
        if (this.description.valid && this.description.value != this.des.value) {
            //this.description.setValue((this.description.value as string).replace(/\s*/g, ''));
            this.store.dispatch(new UpdateDescription(this.description.value)).subscribe();
        }
    }


    myPattern(control: AbstractControl) {
        const result = /^[_,\-,0-9,a-z,A-z,\u3040-\u30ff,\u31f0-\u31ff,\u1100-\u11ff,\u3400-\u4db5,\u4e00-\u9fa5,\u9fa6-\u9fbb,\uf900-\ufa2d,\ufa30-\ufa6a,\ufa70-\ufad9,\u20000-\u2a6d6,\u2f800-\u2fa1d]+$/.test(control.value);
        return result ? null : { 'myPattern': { value: control.value } };
    }
}

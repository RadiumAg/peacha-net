import { State, StateContext, Action, Selector } from '@ngxs/store';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Injectable, ChangeDetectorRef } from '@angular/core';
// local imports
import { throwError, of } from 'rxjs';
import { Me } from '../model/me';
import { IvoryUnauthorizedError } from '../error';
import { Login, Logout, Register, UpdatePublicInformation, FetchMe , UpdateAvatar, UpdateDescription, UpdateNickname, ChangeDisplay,UpdateBanner, SubmitInformation, SubmitCardImage} from './user.action';
import { Router } from '@angular/router';

export interface UserStateModel {
    id: number;
    nickname: string;
    description: string;
    phone: string;
    email: string;
    avatar: string;
    banner: string;
    register_time: number;
    num_followed:number;
    num_following:number;
    like_display:number;
    wallet_state:number;
    identity_state:number;
}

type Context = StateContext<UserStateModel>;

const defaultUserState = {
    id: -1,
    nickname: 'nanashi',
    description: '',
    phone: '',
    email: '',
    avatar: '',
    banner: '',
    register_time: 0,
    num_followed:0,
    num_following:0,
    like_display:0,
    wallet_state:1,
    identity_state:4,
};

@State<UserStateModel>({
    name: 'user',
    defaults: defaultUserState
})
@Injectable()
export class UserState {

    @Selector()
    static isLogin(state: UserStateModel) {
        return state.id > 0;
    }
    @Selector()
    static id(state: UserStateModel) {
        return state.id;
    }

    @Selector()
    static nickname(state: UserStateModel) {
        return state.nickname;
    }
    @Selector()
    static description(state: UserStateModel) {
        return state.description;
    }
    @Selector()
    static avatar(state: UserStateModel) {
        return state.avatar;
    }
    @Selector()
    static banner(state: UserStateModel) {
        return state.banner;
    }
    @Selector()
    static email(state: UserStateModel) {
        return state.email;
    }
    @Selector()
    static phone(state: UserStateModel) {
        return state.phone;
    }
    @Selector()
    static state(state: UserStateModel) {
        return state;
    }

    @Selector()
    static like_display(state: UserStateModel) {
        return state.like_display;
    }

    @Selector()
    static identity_state(state: UserStateModel) {
        return state.identity_state;
    }

    @Selector()
    static basicInfo(state: UserStateModel):{
        nickname:string,
        avatar:string,
        id:number,
        num_followed:number,
        num_following:number,
        banner:string
    } {
        return state;
    }

    constructor(private http: HttpClient) { }

    @Action(Login)
    login(ctx: Context, action: Login) {
        console.log('login');
        return this.http.post('/api/v1/user/login', {
            a: action.account,
            p: action.password,
            v: action.verify_code
        }).pipe(
            switchMap(_ => {
                return ctx.dispatch(new FetchMe());
            }),
            tap(_ => {

            })
        );
    }

    @Action(Logout)
    logout(ctx: Context) {
        return this.http.post<void>('/api/v1/user/logout', null).pipe(
            tap(_ => {
                ctx.setState(defaultUserState);
            })
        );
    }

    @Action(Register)
    register(ctx: Context, action: Register) {
        return this.http.post<void>('/api/v1/user/register', {
            a: action.account,
            p: action.password,
            v: action.verify_code
        });
    }

    @Action(UpdatePublicInformation)
    updatePublicInfo(ctx: Context, action: UpdatePublicInformation) {
        const form = new FormData();
        if (action.avatar) {
            form.append('a', action.avatar);
        }
        form.append('n', action.nickname);
        form.append('d', action.description);
        return this.http.post<{ avatar: string }>('/api/v1/user/update_public_info', form).pipe(
            tap(t => {
                ctx.patchState({
                    avatar: action.avatar.size==undefined ? ctx.getState().avatar : t.avatar,
                    nickname: action.nickname,
                    description: action.description
                });
            })
        );
    }

    @Action(FetchMe)
    fetch(ctx: Context) {
        return this.http.get<Me>('/api/v1/user/me').pipe(
            tap(s => {
                ctx.patchState(s);
            }),
            catchError(e => {
                if (e instanceof IvoryUnauthorizedError) {
                    //console.log('not logined');
                    return of(undefined);
                }
                return throwError(e);
            }),
        );
    }

    @Action(UpdateAvatar)
    UpdateAvatar(ctx: Context, action: UpdateAvatar){
        const form = new FormData();
        form.append('a', action.avatar);
        return this.http.post<{ avatar: string }>('/api/v1/user/update_public_avatar', form).pipe(
            tap(t => {
                ctx.patchState({
                    avatar: action.avatar == undefined ? undefined : t.avatar
                });
            })
        );
    }
    @Action(UpdateBanner)
    UpdateBanner(ctx: Context, action: UpdateBanner){
        const form = new FormData();
        form.append('b', action.banner);
        return this.http.post<{ banner: string }>('/api/v1/user/update_public_banner', form).pipe(
            tap(t => {
                ctx.patchState({
                    banner: action.banner == undefined ? undefined : t.banner
                });
            })
        );
    }

    @Action(UpdateNickname)
    UpdateNickname(ctx: Context, action: UpdateNickname){
        return this.http.post('/api/v1/user/update_public_nickname', {
             n: action.nickname
         }).pipe(
          tap(s => {
                ctx.patchState({
                   nickname: action.nickname
                });
            }),
         );

    }
    @Action(UpdateDescription)
    UpdateDescription(ctx: Context, action: UpdateDescription){
        return this.http.post('/api/v1/user/update_public_description', {
            d: action.description
        }).pipe(
            tap(s => {
                ctx.patchState({
                    description: action.description
                });
            }),
        );
    }
    @Action(ChangeDisplay)
    ChangeDisplay(ctx: Context, action: ChangeDisplay){
        return this.http.post('/api/v1/user/open_like_work', {
            s: action.display
        }).pipe(
            tap(s => {
                ctx.patchState({
                    like_display: action.display
                });
            }),
        );
    }
    @Action(SubmitInformation)
    SubmitInformation(ctx: Context, action: SubmitInformation){
        return  this.http.post('/api/v1/real/submit/identity', {
            token: action.token,
            real_name: action.real_name,
            card_no: action.card_no
        }).pipe(
            tap(s => {
                ctx.patchState({
                    identity_state: 0
                });
            }),
        );
    }

    @Action(SubmitCardImage)
    SubmitCardImage(ctx: Context, action: SubmitCardImage){
        return   this.http.post('/api/v1/real/submit/image', {
            token: action.token,
            face: action.face,
            front: action.front,
            back: action.back
        }).pipe(
            tap(s => {
                ctx.patchState({
                    identity_state: 1
                });
            }),
        );
    }

}

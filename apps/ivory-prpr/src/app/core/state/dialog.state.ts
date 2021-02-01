import { Injectable } from '@angular/core';
import { State, Selector, StateContext, Action } from '@ngxs/store';
import { AddSession, RemoveSession, AddHistroy, ReplyUnreadCounnt, ReduceUnreadCounnt, AddSessionOne, RemoveSessionAll, RemoveHistroyAll, AddUnreadCounnt } from './dialog.action';
import { patch, insertItem } from '@ngxs/store/operators';
import { HttpClient } from '@angular/common/http';
import { timer } from 'rxjs';


export interface DialogStateModel {
    unreadCount: number;
    list: Array<any>;
    histroy: Array<any>;
}


type Context = StateContext<DialogStateModel>;

@State<DialogStateModel>({
    name: 'dialog',
    defaults: {
        unreadCount: 0,
        list: [],
        histroy: []
    }
})


@Injectable()
export class DialogState {

    constructor(private http: HttpClient) { }

    @Selector()
    static list(state: DialogStateModel) {
        return state.list;
    }

    @Selector()
    static unread(state: DialogStateModel) {
        return state.unreadCount;
    }

    @Selector()
    static histroy(state: DialogStateModel) {
        return state.histroy;
    }
    @Action(AddSession)
    add(ctx: Context, action: AddSession) {
        ctx.dispatch(new RemoveSessionAll()).subscribe(s => {
            return ctx.setState(
                patch({
                    list: action.session
                })
            )
        })


    }


    @Action(AddSessionOne)
    addone(ctx: Context, action: AddSessionOne) {
        // ctx.dispatch(new RemoveSessionAll()).subscribe(s=>{
        return ctx.setState(
            patch({
                list: insertItem(action.session)
            })
        )
        // })


    }
    @Action(RemoveSessionAll)
    removeAll(ctx: Context) {
        return ctx.setState(
            patch({
                list: []
            })
        )
    }




    @Action(RemoveSession)
    remove(ctx: Context, action: RemoveSession) {
        ctx.setState(
            patch({
                list: ctx.getState().list.filter((v) => {
                    return action.session.indexOf(v) == -1;
                })
            })
        )
    }


    @Action(AddHistroy)
    addHistroy(ctx: Context, action: AddHistroy) {
        return ctx.setState(
            patch({
                histroy: insertItem(action.histroy, 9999)
            })

        )
    }


    @Action(RemoveHistroyAll)
    removeHistroy(ctx: Context, action: RemoveHistroyAll) {
        return ctx.setState(
            patch({
                histroy: []
            })

        )
    }


    @Action(ReplyUnreadCounnt)
    reply(ctx: Context, action: ReplyUnreadCounnt) {
        return ctx.setState(
            patch({
                unreadCount: action.count ? action.count : 0
            })
        )
    }


    @Action(ReduceUnreadCounnt)
    reduce(ctx: Context, action: ReduceUnreadCounnt) {
        return ctx.setState(
            patch({
                unreadCount: ctx.getState().unreadCount - action.count
            })
        )
    }

    @Action(AddUnreadCounnt)
    addUnread(ctx: Context, action: AddUnreadCounnt) {
        return ctx.setState(
            patch({
                unreadCount: ctx.getState().unreadCount + 1
            })
        )
    }
}
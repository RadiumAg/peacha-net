import { Injectable } from '@angular/core';
import { State, Selector, StateContext, Action } from '@ngxs/store';
import {
	AddSession,
	RemoveSession,
	AddHistroy,
	ReplyUnreadCounnt,
	ReduceUnreadCounnt,
	AddSessionOne,
	RemoveSessionAll,
	RemoveHistroyAll,
	AddUnreadCounnt,
	AddOneHistroy,
} from './chat.action';
import { patch, insertItem } from '@ngxs/store/operators';

export interface ChatStateModel {
	unreadCount: number;
	list: Array<any>;
	histroy: Array<any>;
}

type Context = StateContext<ChatStateModel>;

@State<ChatStateModel>({
	name: 'chat',
	defaults: {
		unreadCount: 0,
		list: [],
		histroy: [],
	},
})
@Injectable()
export class ChatState {
	constructor() {}

	@Selector()
	static list(state: ChatStateModel) {
		return state.list;
	}

	@Selector()
	static unread(state: ChatStateModel) {
		return state.unreadCount;
	}

	@Selector()
	static histroy(state: ChatStateModel) {
		return state.histroy;
	}
	@Action(AddSession)
	add(ctx: Context, action: AddSession) {
		ctx.dispatch(new RemoveSessionAll()).subscribe(s => {
			return ctx.setState(
				patch({
					list: action.session,
				})
			);
		});
	}

	@Action(AddSessionOne)
	addone(ctx: Context, action: AddSessionOne) {
		// ctx.dispatch(new RemoveSessionAll()).subscribe(s=>{
		return ctx.setState(
			patch({
				list: insertItem(action.session, 0),
			})
		);
		// })
	}
	@Action(RemoveSessionAll)
	removeAll(ctx: Context) {
		return ctx.setState(
			patch({
				list: [],
			})
		);
	}

	@Action(RemoveSession)
	remove(ctx: Context, action: RemoveSession) {
		ctx.setState(
			patch({
				list: ctx.getState().list.filter(v => {
					return action.session.roomid != v.roomid;
				}),
			})
		);
	}
	@Action(AddOneHistroy)
	addonehistroy(ctx: Context, action: AddOneHistroy) {
		return ctx.setState(
			patch({
				histroy: ctx.getState().histroy.concat(action.histroy),
			})
		);
	}

	@Action(AddHistroy)
	addHistroy(ctx: Context, action: AddHistroy) {
		return ctx.setState(
			patch({
				histroy: action.histroy,
			})
		);
	}

	@Action(RemoveHistroyAll)
	removeHistroy(ctx: Context, action: RemoveHistroyAll) {
		return ctx.setState(
			patch({
				histroy: [],
			})
		);
	}

	@Action(ReplyUnreadCounnt)
	reply(ctx: Context, action: ReplyUnreadCounnt) {
		return ctx.setState(
			patch({
				unreadCount: action.count ? action.count : 0,
			})
		);
	}

	@Action(ReduceUnreadCounnt)
	reduce(ctx: Context, action: ReduceUnreadCounnt) {
		return ctx.setState(
			patch({
				unreadCount: ctx.getState().unreadCount - action.count,
			})
		);
	}

	@Action(AddUnreadCounnt)
	addUnread(ctx: Context, action: AddUnreadCounnt) {
		return ctx.setState(
			patch({
				unreadCount: Number(ctx.getState().unreadCount) + 1,
			})
		);
	}
}

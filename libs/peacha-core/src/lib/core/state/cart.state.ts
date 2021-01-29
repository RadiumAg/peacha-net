import { State, StateContext, Action, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { AddToCart, RemoveFromCart } from './cart.action';
import { insertItem, patch } from '@ngxs/store/operators';

export interface CartStateModel {
	count: number;
	list: Array<number>;
}

type Context = StateContext<CartStateModel>;

@State<CartStateModel>({
	name: 'cart',
	defaults: {
		count: 0,
		list: [],
	},
})
@Injectable()
export class CartState {
	@Selector()
	static count(state: CartStateModel) {
		return state.count;
	}

	@Selector()
	static list(state: CartStateModel) {
		return state.list;
	}

	constructor() {}

	@Action(AddToCart)
	add(ctx: Context, action: AddToCart) {
		ctx.setState(
			patch({
				list: insertItem(action.goodsId),
			})
		);
	}

	@Action(RemoveFromCart)
	remove(ctx: Context, action: RemoveFromCart) {
		ctx.setState(
			patch({
				list: ctx.getState().list.filter(v => {
					return action.goodsList.indexOf(v) == -1;
				}),
			})
		);
	}
}

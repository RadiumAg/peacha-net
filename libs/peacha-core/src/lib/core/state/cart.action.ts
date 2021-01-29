export class AddToCart {
	static type = '[Cart] add';
	constructor(public goodsId: number) {}
}

export class RemoveFromCart {
	static type = '[Cart] remove';
	constructor(public goodsList: Array<number>) {}
}

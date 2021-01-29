export class AddSession {
	static type = '[Chat] AddSession';
	constructor(public session: any) {}
}
export class AddSessionOne {
	static type = '[Chat] AddSessionOne';
	constructor(public session: any) {}
}

export class RemoveSession {
	static type = '[Chat] RemoveSession';
	constructor(
		public session: {
			message: {
				content: string;
				type: number;
				speaktime: number;
			};
			roomid: string;
			sender_id: number;
			sender_avatar: string;
			sender_nickname: string;
		}
	) {}
}

export class RemoveSessionAll {
	static type = '[Chat] RemoveSessionAll';
	constructor() {}
}

export class AddHistroy {
	static type = '[Chat] AddHistroy';
	constructor(public histroy: any) {}
}

export class AddOneHistroy {
	static type = '[Chat] AddOneHistroy';
	constructor(public histroy: any) {}
}

export class RemoveHistroyAll {
	static type = '[Chat] RemoveHistroyAll';
	constructor() {}
}

export class ReplyUnreadCounnt {
	static type = '[Chat] ReplyUnreadCounnt';
	constructor(public count: number) {}
}

export class ReduceUnreadCounnt {
	static type = '[Chat] ReduceUnreadCounnt';
	constructor(public count: number) {}
}

export class AddUnreadCounnt {
	static type = '[Chat] AddUnreadCounnt';
	constructor() {}
}

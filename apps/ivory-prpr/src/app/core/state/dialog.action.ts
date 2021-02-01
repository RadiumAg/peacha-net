export class AddSession {
    static type = '[Dialog] AddSession';
    constructor(public session: any) { }
}
export class AddSessionOne {
    static type = '[Dialog] AddSessionOne';
    constructor(public session: any) { }
}

export class RemoveSession {
    static type = '[Dialog] RemoveSession';
    constructor(public session: any) { }
}

export class RemoveSessionAll {
    static type = '[Dialog] RemoveSessionAll';
    constructor() { }
}

export class AddHistroy {
    static type = '[Dialog] AddHistroy';
    constructor(public histroy: any,public sessionId:string) { }
}

export class RemoveHistroyAll {
    static type = '[Dialog] RemoveHistroyAll';
    constructor() { }
}


export class ReplyUnreadCounnt {
    static type = '[Dialog] ReplyUnreadCounnt';
    constructor(public count: number) { }
}

export class ReduceUnreadCounnt {
    static type = '[Dialog] ReduceUnreadCounnt';
    constructor(public count: number) { }
}


export class AddUnreadCounnt {
    static type = '[Dialog] AddUnreadCounnt';
    constructor() { }
}




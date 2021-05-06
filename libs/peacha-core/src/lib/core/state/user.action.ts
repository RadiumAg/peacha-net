export class Login {
	static type = '[User] Update login';
	constructor(public account: string, public password: string, public captcha: string, public verify_code?: string) {}
}

export class Logout {
	static type = '[User] Update logout';
	constructor() {}
}

export class Register {
	static type = '[User] Update register';
	constructor(public account: string, public password: string, public verify_code: string) {}
}

export class UpdatePublicInformation {
	static type = '[User] Update public information';
	constructor(public nickname: string, public description: string, public avatar?: Blob) {}
}

export class FetchMe {
	static type = '[User] Fetch';
	constructor() {}
}

export class UpdateAvatar {
	static type = '[User] Update avatar';
	constructor(public avatar: Blob) {}
}
export class UpdateNickname {
	static type = '[User] Update nickname';
	constructor(public nickname?: string) {}
}
export class UpdateDescription {
	static type = '[User] description';
	constructor(public description?: string) {}
}
export class UpdateBanner {
	static type = '[User] Update banner';
	constructor(public banner: Blob) {}
}

export class ChangeDisplay {
	static type = '[User] Change display';
	constructor(public display?: number) {}
}

export class SubmitInformation {
	static type = '[user] Submit information';
	constructor(public token: string, public real_name: string, public card_no: string) {}
}

export class SubmitCardImage {
	static type = '[User] Submit Image';
	constructor(public token: string, public face: string, public front: string, public back: string) {}
}

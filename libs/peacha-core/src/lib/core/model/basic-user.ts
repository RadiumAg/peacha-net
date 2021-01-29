export interface OpalBasicUser {
	uid: number;
	nickname: string;
	description: string;
	avatar: string;
	follow_state: 'none' | 'following' | 'twoway';
}

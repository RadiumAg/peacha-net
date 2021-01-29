export interface OpalUser {
	id: number;
	nickname: string;
	description: string;
	num_following: number;
	num_followed: number;
	like_count: number;
	follow_state: number;
	avatar: number;
	banner: string;
}

export type ModelComment = {
	id: number;
	nickname: string;
	userid: number;
	avatar: string;
	content: string;
	comment_time: number;
	like_count: number;
	is_like: number;
	comment_count: number;
	comment_list: ModelSubComment[];
};

export type ModelSubComment = {
	id: number;
	userid: number;
	nickname: string;
	avatar: string;
	content: string;
	comment_time: number;
	like_count: number;
	is_like: number;
	replied_user_id: number;
	replied_user_name: string;
};

export type TGetWorktag = { id: number; name: string };

export interface Work {
	assets?: [];
	authorAvatar?: string;
	authorId?: number;
	authorName?: string;
	category?: number;
	collectCount?: number;
	commentAreaid?: number;
	commentCount?: number;
	copyright?: number;
	cover?: string;
	description?: string;
	file?: string;
	fileData?: string;
	fileSize?: number;
	bvNumber?: string;
	followState?: number;
	id?: number;
	isCollect?: number;
	isLike?: number;
	likeCount?: number;
	name?: string;
	publishtime?: string;
	shareCount?: number;
	tag?: string[] | TGetWorktag[];
	updatetime?: string;
	cooperateid?: number;
	authority?: number[];
	goodsList?: {
		file: '';
		fileNameList: [];
		fileSize: string;
		id: number;
		maxStock: number;
		name: string;
		price: number;
		sellState: number;
		fileType: number;
	}[];
}

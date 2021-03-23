export interface Works {
	count: number;
	list: {
		id: number;
		name: string;
		likeCount: number;
		collectCount: number;
		publishTime: number;
		avatar: string;
		cover: string;
		category: number;
		price: number;
		userId: number;
		nickName: string;
		stock: number;
	}[];
}

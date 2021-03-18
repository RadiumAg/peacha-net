export interface Works {
	count: number;
	list: {
		id: number;
		name: string;
		like_count: number;
		collect_count: number;
		publishtime: number;
		avatar: string;
		cover: string;
		category: number;
		price: number;
		userid: number;
		nickname: string;
		stock: number;
	}[];
}

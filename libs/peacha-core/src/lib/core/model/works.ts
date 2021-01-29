export interface Works {
	count: number;
	list: {
		id: number;
		cover: string;
		name: string;
		like_count: number;
		collect_count: number;
		price: number;
		state: number;
		category: number;
	};
}

export interface Commission {
	id: number;
	name: string;
	day: number;
	publishTime: number;
	category: number;
	count?: number;
	minPrice: number;
	maxPrice: number;
	finalPrice: number;
	detail: string;
	status: number;
	updateTime: number;
	receiver?: {
		id: number;
		nickname: string;
		avatar: string;
	};
	sponsor?: {
		id: number;
		nickname: string;
		avatar: string;
	};
}

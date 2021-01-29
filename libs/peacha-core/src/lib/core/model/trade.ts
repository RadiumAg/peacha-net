export type TradeChannel = {
	list: {
		id: number;
		name: string;
		isEnable: boolean;
		channelParamsDefines: {
			key: string;
			show: string;
			tips: string;
		}[];
	}[];
	count: number;
};

// export type TradeInfo = {
//     amount: number,
//     title: string,
//     description: string,
//     channel: number,
//     status: number,
//     start_time: number,
//     end_time: number,
//     remarks: number
// };

export type TradeInfo = {
	amount: number;
	title: string;
	startTime: number;
	status: number;
	orders: {
		orderId: string;
		name: string;
		price: string;
		page: string;
	}[];
};

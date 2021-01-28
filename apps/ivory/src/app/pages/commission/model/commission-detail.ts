export interface CommissionDetail {
  commission: {
    name: string;
    secrecy: number;
    secrecyDescription: string;
    day: number;
    publishTime: number;
    expireTime: number;
    startTime: number;
    minPrice: number;
    maxPrice: number;
    finalPrice: number;
    detail: string;
    expressionCount: number;
    actionCount: number;
    file: string;
    fileImages: Array<string>;
    fileName: string;
    status: number;
    modifyCount: number;
    category: number;
  };
  sponsor: {
    id: number;
    nickName: string;
    avatar: string;
  };
  receiver: {
    id: number;
    nickName: string;
    avatar: string;
  };
  property: {
    design: number;
    width: number;
    high: number;
    split: number;
    project: number;
  };
  nodeList: {
    name: string;
    rate: number;
    status: number;
    type: number;
    id: number;
  }[];
}

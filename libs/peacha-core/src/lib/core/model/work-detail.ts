export interface WorkDetail {
    id: number;
    name: string;
    category?: number;
    file?: string;
    fileData?: string;
    fileSize?: number;
    publishTime?: string;
    cover?: string;
    copyright?: number;
    bvNumber?: string;
    authority?: number[];
    tag?: [];
    assets?: [];
    userId?: number;
    nickName?: string
    avatar?: string;
    followState?: number;
    likeCount?: number;
    isLike?: number;
    collectCount?: number;
    isCollect?: number;
    shareCount?: number;
    description?: string;
    commentAreaId?: number;
    commentCount?: number;
    goodsList?: {
        name: string;
        fileSize: string;
        fileType: number;
        id: number;
        maxStock: number;
        price: number;
        saleNumber: number;
        sellState: number;
        ownState: boolean;
    }[];

}

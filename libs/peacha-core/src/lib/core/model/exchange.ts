export interface Exchange {
    count: string;
    list: [{ code: string; createtime: number; second: number }?];
}

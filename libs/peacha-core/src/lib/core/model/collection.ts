export interface Collection {
   count: number;
   list: {
       id: number,
       cover: string,
       name: string,
       work_count: number,
       createtime: Date,
       like_count:number,
       subscribe_count:number,
       nickname:string
   };
}

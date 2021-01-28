export interface Me {
    id: number;
    nickname: string;
    description: string;
    avatar: string;
    banner: string;
    phone_masked: string;
    email_masked: string;
    register_time: number;
    like_display:number;
    collect_count:number;
    email:string;
    identity_state:number;
    like_count:number;
    num_followed:number;
    num_following:number;
    phone:string;
    role:Array<{id:number;expiry:number}>

}

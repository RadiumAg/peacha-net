export interface CooperateDetail {
    id: number;
    launch_workid: number;
    launch_cover: string;
    launch_name: string;
    launch_category: 0 | 1;
    launch_publishtime: string;
    launch_userid: number;
    launch_username: string;
    participate_workid: number;
    participate_cover: string;
    participate_name: string;
    participate_category: 0 | 1;
    participate_userid: number;
    participate_publishtime: string;
    participate_username: string;
    participate_share: string;
    state: number;
    time: string;
    list: any[];
}

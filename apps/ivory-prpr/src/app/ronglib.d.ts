declare interface RongIMEvent {

}

declare interface RongIMUser {

}


declare interface RongIMConversation {
    type: number;
    targetId: string;
    unreadMessageCount: number;
    latestMessage: any;
    hasMentiond: boolean;
    mentiondInfo: any;
    notificationStatus: RomgIMMentiondInfo;
    isTop: number;

 
    send(obj: {
        messageType: string,
        content: string,
        isPersited?: boolean,
        isCounted?: boolean,
        pushContent?: string,
        pushData?: string,
        isVoipPush?: string,
        isStatusMessage?: boolean
    }):void;

    desroty(): Promise<any>;

    getTotalUnreadCount(): Promise<any>;

    read(): Promise<any>;

    getUnreadCount(): Promise<any>;

    setStatus(option: {
        isNotification?: number,
        isTop?: Boolean
    }): Promise<any>;
}


declare interface conversation {
    conversationType: number,
    targetId: string,
    latestMessageId: string,
    objectName: string,
    unreadMessageCount: number,
    latestMessage: object,
    sentStatus: number,
    sentTime: number
}

declare interface RongIMMessage {
    type: number,
    targetId: string,
    senderUserId: string,
    content: any
}

declare interface RomgIMMentiondInfo {
    type: number;
    userIdList: Array<string>;
}

declare namespace RongIMLib {

    const CONVERSATION_TYPE: {
        PRIVATE: 1,
        GROUP: 3,
        CHATROOM: 4,
        CUSTOMER_SERVICE: 5,
        SYSTEM: 6,
        RTC_ROOM: 12
    };

    const MESSAGE_TYPE : {
        TEXT: 'RC:TxtMsg',
        VOICE: 'RC:VcMsg',
        HQ_VOICE: 'RC:HQVCMsg',
        IMAGE: 'RC:ImgMsg',
        GIF: 'RC:GIFMsg',
        RICH_CONTENT: 'RC:ImgTextMsg',
        LOCATION: 'RC:LBSMsg',
        FILE: 'RC:FileMsg',
        SIGHT: 'RC:SightMsg',
        COMBINE: 'RC:CombineMsg',
        CHRM_KV_NOTIFY: 'RC:chrmKVNotiMsg',
        LOG_COMMAND: 'RC:LogCmdMsg'
      };

    function init(config: {
        appkey: string,
        debug?: boolean,
        detect?: {
            url: string,
            intervalTime: number
        }
    }): any;

    function watch(obj: {
        conversation?: (event: any) => void,
        message?: (event: RongIMMessage) => void,
        status?: (event: any) => void
    }): void;

    function connect(user: {
        token: string
    }): Promise<any>;

    function disconnect(): Promise<void>;

    function changeUser(user: {
        token?: string
    }): Promise<void>;


    class Conversation {
        static getList(option: {
            count: number
        }): Promise<Array<RongIMConversation>>;

        static getConversation(option: {
            conversationType: number,
            targetId: string,
            option2: {//回调对象是这么写的？
                onSucess: () => {}
            }
        }): Promise<conversation>

        static get(option: {
            targetId: string,
            type: number
        }): Promise<RongIMConversation>;


    }




}
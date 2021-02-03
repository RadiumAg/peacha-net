declare class NIM {
  static getInstance(options: {
    debug: boolean;
    appKey: string;
    account: string;
    token: string;
    db?: boolean;
    onconnect(): void;
    onerror(error: any, obj: any): void;
    onwillreconnect(obj: any): void;
    ondisconnent(obj: any): void;
    onloginportschange(loginPorts: any): void;
    onSessions(sessions: any): void;
    onupdatesession(session: any): void;
    onmsg(msg: any): void;
    onsyncdone(): void;
    onSessionsWithMoreRoaming(): void;
    syncRoamingMsgs: boolean;
    onroamingmsgs(): void
  }): nim;

  static support: {
    db: boolean;
  }
}



declare interface nim {
  logout(): void;
  disconnect(): void;

  sendText(options: {
    scene: string;
    to: string;
    text: string;
    done(error: any, msg: IMMessage): void;
  }): IMMessage;

  mergeSessions(
    olds: Array<Session>,
    news: Session | Array<Session>
  ): Array<Session>;
  mergeMsgs(
    olds: Array<IMMessage>,
    news: Session | Array<IMMessage>
  ): Array<IMMessage>;
  getHistoryMsgs(options: {
    scene: string,
    to: string,
    limit: number,
    beginTime?: number,
    endTime?: number,
    reverse?: boolean,
    done(error: any, obj: { msgs: any; }): void
  }): void;
  sendMsgReceipt(options: {
    msg: IMMessage,
    done(error: any, obj: { msgs: any; }): void
  }): void;
  resetSessionUnread(sessionId: string): void;
  // getServerSessions(options:{
  //     minTimestamp?:number,
  //     maxTimestamp?:number,
  //     needLastMsg?:boolean,
  //     limit?:number,
  //     done?(error:any, obj:any):void
  // }):void
  getLocalSessions(opion: {
    lastSessionId?: string,
    limit: number;
    done(error: any, obj: any): void
  }): void;

}


declare interface IMMessage {
  idClient: string;
  scene: string;
  type: string;
  sessionId: {
    from: string,
    to: string,
    time: number,
    type: string,
    text: string,
    userUpdateTime: number,
    statue: string,
    target: string,
    sessionId: string,
    flow: string
  }[];
}
declare interface Session {
  nickname: string;
  avatar: string;
  id: string;
  scene: string;
  to: string;
  updateTime: number;
  unread: number;
  lastMsg: {
    scene: string,
    from: string,
    fromNick: string,
    fromClientType: string,
    fromDeviceId: string,
    to: string,
    time: number,
    type: string,
    text: string,
    userUpdateTime: number,
    status: string,
    target: string,
    sessionId: string
  }[];
}

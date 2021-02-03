import { Resolve, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { ChatStartService } from '@peacha-core';

type RoomList = {
	list: {
		message: {
			content: string;
			type: number;
			speaktime: number;
		};
		unread: number;
		roomid: string;
		sender_id: number;
		sender_avatar: string;
		sender_nickname: string;
	}[];
};
@Injectable()
export class ChatResolve implements Resolve<any> {
	constructor(private chat: ChatStartService, private router: Router, private store: Store, private http: HttpClient) { }

	totalCount = 0;

	resolve() {
		return this.http.get<RoomList>(`/chat/room_list?r=&s=20`).pipe(
			switchMap(list => {
				const idlist = [];
				let roomList = [];

				roomList = list.list;
				list.list.forEach(l => {
					idlist.push(l.sender_id);
				});

				return this.http
					.post<{ list: { id: number; nickname: string; avatar: string }[] }>(`/user/get_user_list`, {
						u: idlist,
					})
					.pipe(
						switchMap(s => {
							s.list.forEach(l => {
								const index = roomList.findIndex(item => item.sender_id == l.id);
								roomList[index] = {
									...roomList[index],
									sender_avatar: l.avatar,
									sender_nickname: l.nickname,
								};
							});

							return this.http.get<{ roomid: string; count: number }[]>('/chat/unread_count').pipe(
								map(x => {
									x.forEach(l => {
										const i = roomList.findIndex(item => item.roomid == l.roomid);
										roomList[i] = {
											...roomList[i],
											unread: l.count,
										};
										this.totalCount = this.totalCount + l?.count;
									});
									this.chat.totalUnread$.next(this.totalCount);

									return roomList;
								})
							);
						})
					);
			})
		);
	}
}

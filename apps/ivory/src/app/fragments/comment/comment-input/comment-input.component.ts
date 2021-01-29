import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ModelComment } from '../model';
import { UserState } from '@peacha-core';

@Component({
	selector: 'ivo-comment-input',
	templateUrl: './comment-input.component.html',
	styleUrls: ['./comment-input.component.less'],
	inputs: ['aid', 'comment'],
})
export class CommentInputComponent {
	@Select(UserState.avatar)
	avatar$: Observable<string>;

	@Select(UserState.basicInfo)
	basicInfo$: Observable<{
		nickname: string;
		avatar: string;
		id: number;
		num_followed: number;
		num_following: number;
		banner: string;
	}>;

	aid: number;
	comment: {
		count: number;
		list: ModelComment[];
	};

	one: ModelComment;
	@ViewChild('text') text: ElementRef<HTMLTextAreaElement>;

	constructor(private http: HttpClient) {}

	send() {
		this.http
			.post<{ id: number }>('/comment/comment', {
				a: this.aid,
				c: this.text.nativeElement.value,
			})
			.subscribe(s => {
				//console.log(s);
				this.comment.count++;
				this.basicInfo$.subscribe(info => {
					this.one = {
						id: s.id,
						nickname: info.nickname,
						userid: info.id,
						avatar: info.avatar,
						content: this.text.nativeElement.value,
						comment_time: Date.now(),
						like_count: 0,
						is_like: 0,
						comment_count: 0,
						comment_list: [],
					};
				});
				this.comment.list.unshift(this.one);

				//console.log('success');
				this.text.nativeElement.value = '';
			});
	}
}

import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ModelComment } from '../model';
import { UserState } from '@peacha-core';
import { CommentApiService } from '../comment-api.service';

@Component({
	selector: 'ivo-comment-input',
	templateUrl: './comment-input.component.html',
	styleUrls: ['./comment-input.component.less']
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

	@Input() aid: number;
	@Input() comment: {
		count: number;
		list: ModelComment[];
	};

	one: ModelComment;
	@ViewChild('text') text: ElementRef<HTMLTextAreaElement>;

	constructor(
		private http: HttpClient,
		private commentApi: CommentApiService
	) { }

	send() {
		// this.http
		// 	.post<{ id: number }>('/comment/comment', {
		// 		a: this.aid,
		// 		c: this.text.nativeElement.value,
		// 	})
		this.commentApi.firstLevelComments(this.aid, this.text.nativeElement.value)
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

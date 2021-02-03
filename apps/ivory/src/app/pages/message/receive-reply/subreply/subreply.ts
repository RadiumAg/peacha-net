import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModalService } from '@peacha-core';
import { PopTips } from '@peacha-core/components';

type Detail = {
	id: number;
	news_type: number;
	source_id: string;
	details: string;
	centent: string;
	public_time: string;
	public_userid: number;
	public_username: string;
	public_useravatar: string;
	one: string;
	two: string;
	catenation: string;
};
@Component({
	selector: 'ivo-subreply',
	templateUrl: './subreply.html',
	styleUrls: ['./subreply.less'],
})
export class Subreply {
	@Input() item: Detail;
	@Input() avatar: string;

	active = false;
	replyControl: FormControl = new FormControl('');
	constructor(private http: HttpClient, private modal: ModalService) { }

	reply(): void {
		this.active = true;
	}

	send(id: string): void {
		this.http
			.post<{ id: number }>('/comment/comment_sub', {
				c: this.replyControl.value,
				r: Number(id),
			})
			.subscribe(_ => {
				this.replyControl.setValue('');
			});
	}

	toDetail(url: string, id: string): void {
		this.http.get<{ rootid: number; root_index: number; sub_index: number }>(`/comment/reply_jump?c=${id}`).subscribe(s => {
			if (s.root_index != -1) {
				window.open(`${url}?root=${s.root_index}&sub=${s.sub_index}&rootid=${s.rootid}#${'reply' + id}`);
			} else {
				this.modal.open(PopTips, ['该评论不存在', false]);
			}
		});
	}
}

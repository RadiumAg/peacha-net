import { Component, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { ModalRef, MODAL_DATA_TOKEN } from '@peacha-core';

@Component({
	selector: 'ivo-complain',
	templateUrl: './complain.html',
	styleUrls: ['./complain.less'],
})
export class Complain {
	@ViewChild('text') text: HTMLElement;

	keywordList$ = new BehaviorSubject<Set<string>>(new Set());
	tokenList$ = new BehaviorSubject<Array<string>>([]);
	imgList$ = new BehaviorSubject<Array<string>>([]);


	keyArray = ['违法违禁', '色情', '低俗', '赌博诈骗', '血腥暴力', '人身攻击', '引战', '青少年不良信息', '其他问题'];

	constructor(
		private route: ActivatedRoute,
		private http: HttpClient,
		private modalRef: ModalRef<Complain>,
		@Inject(MODAL_DATA_TOKEN) public collectionId: number
	) { }

	close() {
		this.keywordList$.next(new Set());
		this.tokenList$.next([]);
		this.imgList$.next([]);
		this.modalRef.close();
	}

	choice(i: number) {
		this.keywordList$
			.pipe(
				tap(k => {
					return k.add(this.keyArray[i]);
				})
			)
			.subscribe();
	}

	updatePic(url: Blob) {
		//console.log(url.size);
		if (url.size / 1024 / 1024 <= 2) {
			const form = new FormData();
			form.append('f', url);
			this.http.post<any>('/common/upload_file', form).subscribe(s => {
				combineLatest([this.tokenList$, this.imgList$])
					.pipe(
						tap(([token, img]) => {
							token.push(s.token);
							img.push(s.url);
						})
					)
					.subscribe();
			});
		} else {
			alert('上传图片不能超过2M，请重新上传');
		}
	}

	deleteUpdate(i: number) {
		combineLatest([this.tokenList$, this.imgList$])
			.pipe(
				tap(([token, img]) => {
					token.splice(i, 1);
					img.splice(i, 1);
				})
			)
			.subscribe(_ => {
				//console.log(this.imgList$)
				//console.log(this.tokenList$)
			});
	}

	extra(v: string) {
		this.keywordList$
			.pipe(
				tap(k => {
					return k.add(v);
				})
			)
			.subscribe();
	}

	submit() {
		combineLatest(this.keywordList$, this.tokenList$)
			.pipe(
				switchMap(([k, p]) => {
					//console.log(k)
					return this.http.post<void>('/user/report', {
						t: 2,
						o: Number(this.collectionId),
						d: [...Array.from(k)].toString(),
						i: [...p].toString(),
					});
				})
			)
			.subscribe(_ => {
				this.modalRef.close();
			});
	}

	cancel() {
		this.keywordList$.next(new Set());
		this.tokenList$.next([]);
		this.imgList$.next([]);
		this.modalRef.close();
	}
}

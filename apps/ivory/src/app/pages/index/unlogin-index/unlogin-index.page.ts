import { Component, ChangeDetectorRef } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserState } from '@peacha-core';
import { HttpVirtualFileSystem } from 'libs/peacha-studio-core/src/lib/core';

type Banner = {
	name: string;
	imageurl: string;
	url: string;
}[];

type Hot = {
	count: number;
	list: {
		id: number;
		name: string;
		like_count: number;
		collect_count: number;
		cover: string;
		state: number;
		category: number;
		price: number;
		userid: number;
		nickname: string;
	}[];
};

@Component({
	selector: 'ivo-unlogin-index',
	templateUrl: './unlogin-index.page.html',
	styleUrls: ['./unlogin-index.page.less'],
})
export class UnloginIndexPage {
	vfs$ = of(new HttpVirtualFileSystem('/assets/peacha.opal'));
	@Select(UserState.isLogin)
	isLogin$: Observable<boolean>;

	load = true;

	images$ = new BehaviorSubject<Array<string>>([]);
	urls$ = new BehaviorSubject<Array<string>>([]);

	/**未登录主页作品 */
	unloginWork$ = this.http.get<Hot>(`/work/hot_work?p=0&s=5&c=-1`).pipe(
		tap(s => {
			this.load = false;
		})
	);

	constructor(private http: HttpClient, private router: Router) {}

	toWork(id: number, c: number) {
		if (c == 1) {
			this.router.navigate(['illust', id]);
		} else {
			this.router.navigate(['live2d', id]);
		}
	}

	workList: Array<any> = [];

	toTop() {
		document.documentElement.scrollTop = 0;
	}

	toPublish() {
		this.isLogin$.subscribe(s => {
			if (s) {
				this.router.navigate(['/upload']);
			} else {
				this.router.navigate(['/login'], {
					queryParams: {
						return: '',
					},
				});
			}
		});
	}

	toOutside() {
		window.open('https://prprlive.peacha.net/');
	}
}

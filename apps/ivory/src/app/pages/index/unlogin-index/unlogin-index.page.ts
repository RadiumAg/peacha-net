import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserState } from '@peacha-core';
import { HttpVirtualFileSystem } from '@peacha-studio-core/vfs';
import { IndexApiService } from '../index-api.service';

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

	workList = [];

	/**未登录主页作品 */
	unloginWork$ = this.indexApi.getHotWork(0, 5, -1, 0).pipe(
		tap(_s => {
			this.load = false;
		})
	);

	constructor(
		private indexApi: IndexApiService,
		private router: Router
	) { }

	toWork(id: number, c: number) {
		if (c == 1) {
			this.router.navigate(['illust', id]);
		} else {
			this.router.navigate(['live2d', id]);
		}
	}

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

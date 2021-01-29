import { Component, ViewContainerRef, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { IllustZoomModalComponent } from './illust-zoom-modal/illust-zoom-modal.component';
import { ReportModalComponent } from 'libs/peacha-core/src/lib/components/report-modal/report-modal.component';
import { DropDownService } from 'libs/peacha-core/src/lib/core/service/dropdown.service';
import { ModalService } from 'libs/peacha-core/src/lib/core/service/modals.service';
import { ZoomService } from 'libs/peacha-core/src/lib/core/service/zoom.service';
import { CopyrightList } from '@peacha-core';

@Component({
	selector: 'ivo-work',
	templateUrl: './work.page.html',
	styleUrls: ['./work.page.less'],
})
export class WorkPage {
	copyrightIconMap = {
		1: ['/assets/image/copyright/Com_allowed.svg', '/assets/image/copyright/Com_not_allowed.svg'],
		2: ['/assets/image/copyright/Creat_allowed.svg', '/assets/image/copyright/Creat_not_allowed.svg'],
		3: ['/assets/image/copyright/Com_allowed.svg', '/assets/image/copyright/Com_not_allowed.svg'],
		4: ['/assets/image/copyright/Creat_allowed.svg', '/assets/image/copyright/Creat_not_allowed.svg'],
		5: ['/assets/image/copyright/Live_allowed.svg', '/assets/image/copyright/Live_not_allowed.svg'],
		6: ['/assets/image/copyright/Mod_allowed.svg', '/assets/image/copyright/Mod_not_allowed.svg'],
	};

	@ViewChild('dot')
	dot: ElementRef;
	@ViewChild('menuTemp')
	tmp: TemplateRef<any>;

	requesting$ = new BehaviorSubject(false);
	illIndex$ = new BehaviorSubject(0);
	work$: Observable<any>;
	copyrights$ = this.http.get<CopyrightList>('/work/copyright?c=1');
	authorRole: Array<number> = [];

	get page$() {
		return {
			work: this.work$,
			requesting: this.requesting$,
		};
	}

	constructor(
		private route: ActivatedRoute,
		private http: HttpClient,
		private drop: DropDownService,
		private modal: ModalService,
		private zoom: ZoomService,
		private vc: ViewContainerRef,
		private router: Router
	) {
		this.work$ = this.route.data.pipe(
			map(d => d.work),
			tap(i => {
				this.requesting$.next(false);
				this.http
					.get<{
						avatar: string;
						banner: string;
						collect_count: number;
						description: string;
						follow_state: number;
						id: number;
						like_count: number;
						nickname: string;
						num_followed: number;
						num_following: number;
						role: { id: number; expiry: number }[];
					}>(`/user/get_user?i=${i.author_id}`)
					.subscribe(s => {
						s?.role.forEach(l => {
							this.authorRole.push(l.id);
						});
					});
			})
		);
	}

	relevants$ = this.route.params.pipe(
		switchMap(_ => {
			return this.http
				.get<{
					list: {
						id: number;
						cover: string;
						name: string;
						username: string;
						publishtime: number;
						category: number;
					}[];
				}>(`/work/get_relevant_work?w=${_.id}`)
				.pipe();
		})
	);

	openDropDown() {
		this.drop.menu(this.dot, this.tmp, this.vc, 0, 10);
	}

	zoomIn(assets: string[], index: number) {
		this.zoom.open(IllustZoomModalComponent, {
			assets,
			index,
		});
	}

	report(id: number) {
		this.modal.open(ReportModalComponent, id);
	}

	chooseIll(index: number) {
		this.illIndex$.next(index);
		document.documentElement.scrollTop = 0;
	}

	toWork(id: number, type: number) {
		if (type == 1) {
			this.router.navigate(['illust', id]);
		} else {
			this.router.navigate(['live2d', id]);
		}
	}
}

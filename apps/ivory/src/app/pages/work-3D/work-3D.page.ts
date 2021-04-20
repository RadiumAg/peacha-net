import { Component, ViewChild, ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap, switchMap, map } from 'rxjs/operators';
import { Select } from '@ngxs/store';
import { PlatformLocation } from '@angular/common';
import { CopyrightList, DropDownService, ModalService, UserState, ZoomService } from '@peacha-core';
import { HttpVirtualFileSystem, Live2dTransformData, ReadableVirtualFileSystem } from '@peacha-studio-core';
import { ReportModalComponent } from '@peacha-core/components';
import { IllustZoomModalComponent } from '../work/illust-zoom-modal/illust-zoom-modal.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'ivo-work-3d',
	templateUrl: './work-3D.page.html',
	styleUrls: ['./work-3D.page.less'],
})
export class Work3DPage {
	copyrightIconMap = {
		1: ['/assets/image/copyright/Com_allowed.svg', '/assets/image/copyright/Com_not_allowed.svg'],
		2: ['/assets/image/copyright/Creat_allowed.svg', '/assets/image/copyright/Creat_not_allowed.svg'],
		3: ['/assets/image/copyright/Com_allowed.svg', '/assets/image/copyright/Com_not_allowed.svg'],
		4: ['/assets/image/copyright/Creat_allowed.svg', '/assets/image/copyright/Creat_not_allowed.svg'],
		5: ['/assets/image/copyright/Mod_allowed.svg', '/assets/image/copyright/Mod_not_allowed.svg'],
		6: ['/assets/image/copyright/Live_allowed.svg', '/assets/image/copyright/Live_not_allowed.svg'],
		7: ['/assets/image/copyright/Com_allowed.svg', '/assets/image/copyright/Com_not_allowed.svg'],
		8: ['/assets/image/copyright/Creat_allowed.svg', '/assets/image/copyright/Creat_not_allowed.svg'],
		9: ['/assets/image/copyright/Mod_allowed.svg', '/assets/image/copyright/Mod_not_allowed.svg'],
		10: ['/assets/image/copyright/Live_allowed.svg', '/assets/image/copyright/Live_not_allowed.svg'],
	};

	copyrights$ = this.http.get<CopyrightList>('/work/copyright?c=2');

	@Select(UserState.id)
	id$: Observable<number>;

	@ViewChild('dot') dot: ElementRef;
	@ViewChild('menuTemp') tmp: TemplateRef<any>;
	authorRole: Array<number> = [];

	selectedMenu$ = new BehaviorSubject(0);
	illIndex$ = new BehaviorSubject(0);

	work$ = this.route.data.pipe(
		map(d => d.work),
		tap(work => {
			const previewData = work.fileData ? JSON.parse(work.fileData) : null;
			this.transformData = previewData?.transformData as Live2dTransformData;
			this.enableFaceTracker = previewData?.enableFaceTracker;
			this.enableSettingPanel = previewData?.enableSettingPanel;
			this.live2d$ = of(new HttpVirtualFileSystem(work.file));
			this.publicityPeriod$ = of(work.publishTime + 7 * 24 * 60 * 60 * 1000 - Date.now());
			this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
				'https://player.bilibili.com/player.html?bvid=' + work.bvNumber + '&page=1&as_wide=1&high_quality=1&danmaku=0'
			);
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
				}>(`/user/get_user?i=${work.userId}`)
				.subscribe(s => {
					s?.role.forEach(l => {
						this.authorRole.push(l.id);
					});
				});
		})
	);
	live2d$: Observable<ReadableVirtualFileSystem>;
	publicityPeriod$: Observable<number>;
	transformData: Live2dTransformData;
	enableFaceTracker: boolean;
	enableSettingPanel: boolean;

	safeUrl: any;
	constructor(
		private router: Router,
		private platform: PlatformLocation,
		private route: ActivatedRoute,
		private http: HttpClient,
		private drop: DropDownService,
		private modal: ModalService,
		private vc: ViewContainerRef,
		private zoom: ZoomService,
		private sanitizer: DomSanitizer
	) { }

	relevants$ = this.route.params.pipe(
		switchMap(_ => {
			return this.http
				.get<
					{
						id: number;
						cover: string;
						name: string;
						nickName: string;
						userId: number;
						publishTime: number;
						category: number;
					}[]
				>(`/work/get_relevant_work?w=${_.id}`)
				.pipe();
		})
	);

	openDropDown() {
		this.drop.menu(this.dot, this.tmp, this.vc, 0, 10);
	}

	report(id: number) {
		this.modal.open(ReportModalComponent, id);
	}

	toLogin() {
		this.router.navigate(['/passport/login'], {
			queryParams: {
				return: this.platform.pathname,
			},
		});
	}

	zoomIn(assets: string[], index: number) {
		this.zoom.open(IllustZoomModalComponent, {
			assets,
			index,
		});
	}

	chooseIll(index: number) {
		this.illIndex$.next(index);
		document.documentElement.scrollTop = 0;
	}
}

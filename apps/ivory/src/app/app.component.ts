import { NavigationEnd, Router } from '@angular/router';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { filter, map } from 'rxjs/operators';

declare let gtag: (
	eventName: string,
	param: any,
	param2: any
) => {
	//
};

@Component({
	selector: 'ivo-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
	title = 'ivory';

	showNavbar$ = this.router.events.pipe(
		filter(event => event instanceof NavigationEnd),
		map((event: NavigationEnd) => {
			if (event.url.startsWith('/n7r')) {
				return false;
			}
			return true;
		})
	);

	showFooter$ = this.router.events.pipe(
		filter(event => event instanceof NavigationEnd),
		map((event: NavigationEnd) => {
			console.log(event.urlAfterRedirects);
			if (event.url.startsWith('/n7r')) {
				return false;
			}
			return true;
		})
	);

	constructor(public router: Router, private translateService: TranslateService) {
		if (environment.production) {
			this.router.events.subscribe(event => {
				if (event instanceof NavigationEnd) {
					gtag('config', 'G-00TZ4R0C6N', {
						page_path: event.urlAfterRedirects,
					});
				}
			});
		}
	}

	ngOnInit() {
		this.translateService.addLangs(['zh', 'en', 'ja']);
		this.translateService.setDefaultLang('zh');
		const browserLang = this.translateService.getBrowserLang();
		this.translateService.use(browserLang.match(/zh|en|ja/) ? browserLang : 'zh');
		window.onpopstate = (ev: PopStateEvent) => {
			ev.cancelBubble = true;
			ev.preventDefault();
			ev.stopImmediatePropagation();
			ev.stopPropagation();
		};
	}
}

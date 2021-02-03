import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'ivo-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    title = 'ivory';

    constructor(private translateService: TranslateService) {
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

import { NavigationEnd, Router } from '@angular/router';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OnInit } from '@angular/core';
import { environment } from '../environments/environment';

declare let gtag: (eventName: string, param: any, param2: any) => {};

@Component({
  selector: 'ivo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'ivory';

  constructor(public router: Router) {
    if (environment.production) {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          gtag('config', 'G-00TZ4R0C6N', {
            page_path: event.urlAfterRedirects,
          });
        }
      });
    }
  }

  ngOnInit() {
    window.onpopstate = (ev: PopStateEvent) => {
      ev.cancelBubble = true;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      ev.stopPropagation();
    };
  }
}

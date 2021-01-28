import { Renderer2, ElementRef } from '@angular/core';
import {
  AfterViewChecked,
  Component,
  Inject,
  Input,
  OnInit,
  AfterContentInit,
  OnDestroy,
  HostBinding,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FORM_NAV_TOKEN } from 'libs/peacha-core/src/lib/core/tokens';

@Component({
  selector: 'ivo-form-nav',
  templateUrl: './form-nav.component.html',
  styleUrls: ['./form-nav.component.less'],
})
export class FormNavComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(FORM_NAV_TOKEN)
    public form_nav_token: BehaviorSubject<boolean[]>,
    private re2: Renderer2,
    private el: ElementRef
  ) {}

  activeList: boolean[];
  @Input()
  titleList: string[] = [];
  @Input()
  top;

  scroll = (e: Event) => {
    console.log(this.top);
    this.re2.setStyle(
      this.el.nativeElement,
      'top',
      document.scrollingElement.scrollTop + Number(this.top) + 'px'
    );
  };

  ngOnDestroy(): void {
    document.removeEventListener('scroll', this.scroll, true);
    this.form_nav_token.next([]);
  }

  ngOnInit(): void {
    this.init();
  }

  private init() {
    this.titleList.forEach((x) => {
      this.form_nav_token.next(this.form_nav_token.getValue().concat(false));
    });
    document.addEventListener('scroll', this.scroll, true);
  }
}

import { Component, HostListener, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { of, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

type Banner = {
    name: string;
    imageurl: string;
    url: string;
}[];

type Newest = {
    count: number;
    list: {
        id: number;
        public_date: number;
        public_userid: number;
        public_username: string;
        public_useravatar: string;
        work: {
            work_id: number;
            work_name: string;
            description: string;
            collect_count: number;
            state: number;
            cover: string;
            type: number;
        };
    }[];
};

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
        publishtime: number;
    }[];
};

type HotGood = {
    count: number;
    list: {
        id: number;
        name: string;
        like_count: number;
        cover: string;
        type: number;
        price: number;
        userid: number;
        nickname: string;
        publishtime: number;
    }[];
};

type HotTag = {
    list: {
        name: string;
        color: string;
        id: number;
    }[];
};

type HotUser = {
    count: number;
    list: {
        uid: number;
        nickname: string;
        follow_state: number;
        avatar: string;
        description: string;
        like_count: number;
        num_followed: number;
        work_list: {
            id: number;
            cover: string;
            category: number;
        };
    }[];
};

@Component({
    selector: 'ivo-login-index',
    templateUrl: './login-index.page.html',
    styleUrls: ['./login-index.page.less']
})
export class LoginIndexPage {
    constructor(
        private http: HttpClient,
        private router: Router,
        private render: Renderer2
    ) {
    }

    loadOne = true;
    loadTwo = true;
    loadThree = true;
    loadFour = true;
    loadFive = true;
    loadSix = true;
    loadBanner = true;

    curRecommendWorkPart = 0;

    @ViewChild('show') show: ElementRef;

    /**banner图片 */
    banners$ = this.http.get<Banner>('/common/index_banner').pipe(
        tap(s => {
            this.loadBanner = false;
        }),
        catchError(e => {
            return of({
                name: '',
                imageurl: '',
                url: ''
            });
        })
    );


    /**最新作品动态 */
    newest$ = this.http.get<Newest>(`/news/newest?page=0&size=5`).pipe(
        catchError(e => {
            return of({
                count: 0,
                list: []
            });
        })
    );


    changeOriginalWork$ = new BehaviorSubject<number>(0);
    changeLiveWork$ = new BehaviorSubject<number>(0);
    changeHotUser$ = new BehaviorSubject<number>(0);

    /**热门标签 */
    hotTags$ = this.http.get<HotTag>(`/work/hot_tag`).pipe(
        tap(s => {
            this.loadFour = false;
        })
    );
    /**热门全部作品 */
    hotlWork$ = this.changeOriginalWork$.pipe(
        switchMap(_ => {
            return this.http.get<Hot>(`/work/recommend`).pipe(
                tap(s => {
                    console.log(s.list.length);
                })
            );
        }),
        catchError(e => {
            return of({
                count: 0,
                list: []
            });
        })
    );
    /**热门原画作品 */
    hotOriginalWork$ = this.changeOriginalWork$.pipe(
        switchMap(_ => {
            return this.http.get<Hot>(`/work/hot_work?p=0&s=10&c=1`).pipe(
                tap(s => {
                    this.loadOne = false;
                })
            );
        }),
        catchError(e => {
            return of({
                count: 0,
                list: []
            });
        })
    );
    /**热门作品 */
    hotLiveWork$ = this.changeLiveWork$.pipe(

        switchMap(_ => {
            return this.http.get<Hot>(`/work/hot_work?p=0&s=10&c=0`).pipe(
                tap(s => {
                    this.loadTwo = false;
                })
            );
        }),
        catchError(e => {
            return of({
                count: 0,
                list: []
            });
        })
    );
    /**公示期作品 */
    publicWork$ = this.http.get<Hot>(`/work/public_work?p=0&s=5`).pipe(
        tap(s => {
            this.loadThree = false;
        }),
        catchError(e => {
            return of({
                count: 0,
                list: []
            });
        })
    );
    /**热门作者 */
    hotUser$ = this.changeHotUser$.pipe(

        switchMap(s => {
            return this.http.get<HotUser>(`/user/hot_user?p=0&s=4`).pipe(
                tap(() => {
                    this.loadFive = false;
                })
            );
        }),
        catchError(e => {
            return of({
                count: 0,
                list: []
            });
        })
    );
    /**热门商品 */
    hotGoods$ = this.http.get<HotGood>(`/work/hot_goods?p=0&s=10`).pipe(
        tap(s => {
            this.loadSix = false;
        }),
        catchError(e => {
            return of({
                count: 0,
                list: []
            });
        })
    );
    @ViewChild('go', { read: ElementRef })
    private go: ElementRef<any>;
    private upSvg: Document;
    private animateTransforms: any;
    private sets: any;
    private svg: SVGElement;
    private isScrolled = false;

    iframeInit() {
        this.upSvg = (this.go
            .nativeElement as HTMLIFrameElement).getSVGDocument();
        this.animateTransforms = this.upSvg.getElementsByTagName(
            'animateTransform'
        ) as any;

        this.sets = this.upSvg.getElementsByTagName('set') as any;
        this.svg = this.upSvg.getElementsByTagName('svg')[0];
        this.addListener();
    }

    /**
     *  @description 添加监听
     */
    private addListener() {
        const toTop = () => {
            this.isScrolled = true;
            document.scrollingElement.scrollTo({
                behavior: 'smooth',
                top: 0,
            });
        };
        this.svg.addEventListener('click', toTop, true);
        document.addEventListener(
            'wheel',
            (e: Event) => {
                if (this.isScrolled) {
                    e.preventDefault();
                    return false;
                }
            },
            { passive: false }
        );
        this.upSvg.addEventListener(
            'wheel',
            (e: WheelEvent) => {
                if (this.isScrolled) {
                    e.preventDefault();
                    return false;
                }
            },
            { passive: false }
        );
    }

    @HostListener('window:scroll', ['$event'])
    public scrolled($event: Event) {
        if (document.documentElement.scrollTop >= 900) {
            this.render.setStyle(
                this.show.nativeElement,
                'visibility',
                'visible'
            );
        } else if (document.documentElement.scrollTop <= 900) {
            if (this.isScrolled && document.documentElement.scrollTop === 0) {
                if (this.animateTransforms) {
                    for (const item of this.animateTransforms) {
                        item.endElement();
                    }
                }
                if (this.sets) {
                    for (const item of this.sets) {
                        item.endElement();
                    }
                }
                this.render.setStyle(
                    this.show.nativeElement,
                    'visibility',
                    'hidden'
                );
                this.isScrolled = false;
            }
            if (!this.isScrolled) {
                this.render.setStyle(
                    this.show.nativeElement,
                    'visibility',
                    'hidden'
                );
            }
        }
    }

    @HostListener('wheel', ['$event']) public whell($event: Event) { }

    toDetail(i: number) {
        this.router.navigate(['rankling'], {
            queryParams: {
                a: i,
            },
        });
    }

    toNewest() {
        this.router.navigate(['newestWork']);
    }
    toOriginalWork() {
        this.router.navigate(['hotOriginalWork']);
    }
    toLive2DWork() {
        this.router.navigate(['hotLive2DWork']);
    }
    toDetailPublic() {
        this.router.navigate(['publicWork'], {
            queryParams: {
                page: 1,
            },
        });
    }

    toDetailGood() {
        this.router.navigate(['hotgood'], {
            queryParams: {
                page: 1,
            },
        });
    }

    searchWork(id: number, k: string) {
        this.router.navigate(['hotTagWork'], {
            queryParams: {
                id,
                k,
                page: 1,
            },
        });
    }

    toWork(id: number, c: number) {
        if (c == 1) {
            this.router.navigate(['illust', id]);
        } else {
            this.router.navigate(['live2d', id]);
        }
    }
    toUser(id: number) {
        this.router.navigate(['user', id]);
    }
}

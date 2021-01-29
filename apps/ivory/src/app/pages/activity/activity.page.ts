import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'ivo-activity',
	templateUrl: './activity.page.html',
	styleUrls: ['./activity.page.less'],
})
export class ActivityPage implements OnInit {
	but = 0;
	aid = 202;

	id$ = this.http.post(`/user/get_user_list`, {
		u: [12227, 12959, 16654, 13206, 15042, 10308, 12619, 15968, 14098, 14657, 16121, 16888, 13314, 11602, 12302, 12701],
	});
	ten = [12619, 15968, 14098, 14657, 16121, 16888, 13314, 11602, 12302, 12701];
	tenav = [
		'//p0.peacha.net/user/avatar/427c9c9b-1af5-4161-8b47-589f5b502690.jpg',
		'//p0.peacha.net/user/avatar/e29906f7-f5f9-4185-8658-c3924e945c4b.jpg',
		'//p0.peacha.net/user/avatar/e71854ad-6dcd-45d4-a025-554293795cf0.jpg',
		'//p0.peacha.net/user/avatar/b9fa27f1-23df-4ae8-9cab-fcf139e7c84d.jpg',
		'//p0.peacha.net/user/avatar/2180ebbc-2e31-44ed-bce1-67306f1b1280.jpg',
		'//p0.peacha.net/user/avatar/1cb77357-548c-40b0-b937-924e0055727a.jpg',
		'//p0.peacha.net/user/avatar/62644810-1ff5-40f1-a883-57ae4811b9ac.jpg',
		'//p0.peacha.net/user/avatar/57baf825-3a74-49a1-a179-db7d801d3f40.jpg',
		'//p0.peacha.net/user/avatar/f708603a-db40-489d-a8fe-edd020087a5d.jpg',
		'//p0.peacha.net/user/avatar/ea463b52-1078-414d-8012-92b904c90956.jpg',
	];
	tenname = [
		'草青Official',
		'Area酱',
		'AIzacay生菜菜',
		'灰鱼13',
		'无惨继承人',
		'魔装骑士赛璐璐',
		'湊阿库娅',
		'叁無无料',
		'丸子牛逼ccc',
		'猫御daze',
	];
	title = [
		'【丸子】-雪柠（这次不是火柴人了）',
		'仿生绘画机器人AA子',
		'个人模型【飞鱼姬·格里菲斯】模型',
		'【一条龙模型展示】Tiya缇婭',
		'猫御daze 3.3版本',
		'DDDD',
		'凑个参与奖',
		'oraroid',
		'[EFE]没有什么是我珑沁瑶瑶做不到的！',
		'任捷',
	];
	sandeng = [13206, 15042, 10570];
	sandengav = [
		'//p0.peacha.net/user/avatar/54d14d3e-e67c-4b2d-85aa-f00107e4475b.jpg',
		'//p0.peacha.net/user/avatar/473d058a-bd0c-49f6-9d21-566909bab67a.jpg',
		'//p0.peacha.net/user/avatar/0bf461eb-0134-418e-aa8e-adea0accc1a3.jpg',
	];
	sandengname = ['-白空-', '魔法doge', 'POKE'];
	youxiuzuop = [10412, 10326, 10348, 10342, 10273, 10383, 10375, 10321, 10410, 10401];
	constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

	ngOnInit(): void {}

	skipUser(i: number): void {
		this.router.navigate(['/user/', i]);
	}
	skip(i: number): void {
		this.router.navigate(['/live2d/', i]);
	}
}

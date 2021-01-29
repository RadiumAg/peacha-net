import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, catchError, tap, map } from 'rxjs/operators';
import { Select } from '@ngxs/store';
import { UserState, Collection } from '@peacha-core';

type SubscribeCollection = {
	count: number;
	list: {
		id: number;
		cover: string;
		name: string;
		work_count: number;
		createtime: Date;
		mark: number;
		like_count: number;
		subscribe_count: number;
		nickname: string;
	}[];
};

@Component({
	selector: 'ivo-collection',
	templateUrl: './collection.page.html',
	styleUrls: ['./collection.page.less'],
})
export class CollectionPage implements OnInit {
	@Select(UserState.id)
	id$: Observable<number>;

	create$: Observable<Collection> = this.route.parent!.params.pipe(
		switchMap(c => {
			return this.http.get<any>(`/work/get_create_collections?u=${c.id}&p=0&s=4`);
		}),
		catchError(e => {
			return of({
				count: 0,
				list: [],
			});
		})
	);

	subscribed$: Observable<SubscribeCollection> = this.route.parent!.params.pipe(
		switchMap(c => {
			return this.http.get<SubscribeCollection>(`/work/get_subscribe_collections?u=${c.id}&p=0&s=4`);
		}),
		catchError(e => {
			return of({
				count: 0,
				list: [],
			});
		})
	);

	get pageUid$() {
		return this.route.parent!.params.pipe(map(s => s.id as number));
	}

	cancelSubscribe(id: number) {
		this.http
			.post('/work/subscribe_collection', {
				c: id,
			})
			.subscribe();
	}

	constructor(private http: HttpClient, private route: ActivatedRoute) {}

	ngOnInit(): void {}
}

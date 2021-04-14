import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ModalRef } from '@peacha-core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';



@Component({
    selector: 'ivo-n7r-address',
    templateUrl: './addressSelect.html',
    styleUrls: ['./addressSelect.less']
})
export class AddressSelect {


    cityId$ = new BehaviorSubject(0);
    page$ = new BehaviorSubject(0);
    rank$ = new BehaviorSubject(0);

    first: Array<{ id: number, name: string }> = [];
    second: Array<{ id: number, name: string }> = [];
    third: Array<{ id: number, name: string }> = [];
    fourth: Array<{ id: number, name: string }> = [];

    firstRank: { id: number, name: string } = { id: -1, name: '' };
    secondRank: { id: number, name: string } = { id: -1, name: '' };
    thirdRank: { id: number, name: string } = { id: -1, name: '' };
    fourthRank: { id: number, name: string } = { id: -1, name: '' };

    showBox = [true, false, false, false];

    constructor(
        private modalRef: ModalRef<AddressSelect>,
        private http: HttpClient
    ) {

    }


    getAddress$ = combineLatest([
        this.cityId$,
        this.page$
    ]).pipe(
        map(([id, p]) => {
            this.http.get<{
                list: {
                    id: number;
                    name: string;
                }[]
            }>(`/advance/address/select?pi=${id}&p=0&s=50`).subscribe(s => {
                if (this.rank$.value === 0) {
                    this.first = this.first.concat(s.list);
                } else if (this.rank$.value === 1) {
                    this.second = this.second.concat(s.list);
                } else if (this.rank$.value === 2) {
                    // if (s.list.length === 0) {
                    //     this.modalRef.close({ one: this.firstRank, two: this.secondRank });
                    // }
                    this.third = this.third.concat(s.list);
                } else if (this.rank$.value === 3) {
                    // if (s.list.length === 0) {
                    //     this.modalRef.close({ one: this.firstRank, two: this.secondRank, three: this.thirdRank })
                    // }
                    this.fourth = this.fourth.concat(s.list);
                }
            })
        })
    )

    select(item: { id: number, name: string }, rand: number): void {
        this.rank$.next(rand);
        this.cityId$.next(item.id);
        if (rand === 0) {
            this.showBox = [true, false, false, false];
            this.second = [];
            this.third = [];
            this.fourth = [];
            this.secondRank = { id: -1, name: '' };
            this.thirdRank = { id: -1, name: '' };
            this.fourthRank = { id: -1, name: '' };
        } else if (rand === 1) {
            this.showBox = [true, true, false, false];
            this.second = [];
            this.third = [];
            this.fourth = [];
            this.firstRank = item;
            this.secondRank = { id: -1, name: '' };
            this.thirdRank = { id: -1, name: '' };
            this.fourthRank = { id: -1, name: '' };
        } else if (rand === 2) {
            this.showBox = [true, true, true, false];
            this.third = [];
            this.fourth = [];
            this.secondRank = item;
            this.thirdRank = { id: -1, name: '' };
            this.fourthRank = { id: -1, name: '' };
        } else if (rand === 3) {
            this.showBox = [true, true, true, true];
            this.fourth = [];
            this.thirdRank = item;
            this.fourthRank = { id: -1, name: '' };
        } else {
            this.fourthRank = item;
            this.modalRef.close({ one: this.firstRank, two: this.secondRank, three: this.thirdRank, four: this.fourthRank })
        }
    }


    // close(): void {
    //     this.modalRef.close();
    // }

}

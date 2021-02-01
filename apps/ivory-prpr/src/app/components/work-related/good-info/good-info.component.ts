import { Component, Input } from '@angular/core';
import { ModalService } from 'src/app/core/service/modals.service';
import { Store, Select } from '@ngxs/store';
import { CartState } from 'src/app/core/state/cart.state';
import { map, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AddToCart } from 'src/app/core/state/cart.action';
import { BehaviorSubject, Observable, combineLatest,empty } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { UserState } from 'src/app/core';
import { PlatformLocation } from '@angular/common';

@Component({
    selector: 'ivo-good-info',
    templateUrl: './good-info.component.html',
    styleUrls: ['./good-info.component.less']
})
export class GoodInfoComponent {


    @Input() name: string;
    @Input() price: number;
    @Input() goodId: number;
    @Input() own: boolean;
    @Input() size: number;
    @Input() maxStock: number;
    @Input() saleNumber: number;
    @Input() period: number;

    @Select(UserState.id)
    id$: Observable<number>;

    @Select(CartState.list)
    list$:Observable<number[]>;


    fileList$ = new BehaviorSubject({});
    fileListShow = false;

    constructor(private store: Store, private router: Router,private platform:PlatformLocation, private http: HttpClient) { }

    ngAfterViewInit(): void {

    }

    isInCart(goodId: number) {
        return this.list$.pipe(
            map((list)=>{
                    return list.indexOf(goodId)!==-1;
            })
        )
    }

    addToCart() {
        this.store.dispatch(new AddToCart(this.goodId));
    }

    goToCart() {
        this.router.navigateByUrl("/cart");
    }

    addToWarehouse(){
        this.id$.pipe(
            take(1),
            map(id=>{
                if(id>0){
                    this.http.post(`/api/v1/work/add_own`,{
                        w:this.goodId
                    }).pipe(
                        take(1)
                    ).subscribe({
                        next:()=>{
                            this.own = true;
                        },
                        error:(e)=>{
                            //console.log(e)
                        }
                    });
                }else{
                    this.router.navigate(['/passport/login'],{
                        queryParams:{
                            return:this.platform.pathname
                        }
                    });
                }
            })
        )
        .subscribe();
    }

    goToWarehouse() {
        this.router.navigateByUrl("/store");
    }

    showFileList(){
        this.http.get<{ goods_list: string[],work_list:string[],size:number }>(`/api/v1/work/get_goods_detail?g=${this.goodId}`).pipe(
            take(1),
            tap(_=>{
                //console.log(_)
            })
        ).subscribe({
            next:fileList=>{
                this.fileList$.next(fileList);
            }
        })
        this.fileListShow = true;
    }

    closeFileList(){
        this.fileListShow = false;
    }
}

    import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { viewClassName } from '@angular/compiler';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

export class mylist{
    constructor(
       public item:string,
       public param:number
    ){}
}

@Component({
    selector: 'myselect',
    templateUrl: './myselect.component.html',
    styleUrls: ['./myselect.component.less'],
})
export class MyselectComponent implements OnInit {
    constructor(
        private router: Router,
        private vc:ViewContainerRef,
        private overlay:Overlay
        
        ) {}

    ngOnInit(): void {
        this.placeholder$.next(this.list[0].item)
    }

    @Input('list') 
    list:mylist[];


    @Input('current')
    current: string;

    @Output('s')
    s=new EventEmitter<number>()


    @ViewChild('orgin')
    orgin:ElementRef;
    @ViewChild('panel')
    panel:TemplateRef<any>

    currentOverlay:OverlayRef;
    

    isopen$=new BehaviorSubject<boolean>(false)
    placeholder$=new BehaviorSubject<string>('');
    click() {

        if(!this.currentOverlay){
            this.currentOverlay=this.overlay.create({
                positionStrategy:this.overlay
                .position()
                .flexibleConnectedTo(this.orgin)
                .withPositions([{
                    originX:'center',
                    originY:'bottom',
                    overlayX:'center',
                    overlayY:'top',
                    offsetY:-32
                },
                ]),
            });
        }
        if(this.isopen$.value){
            this.isopen$.next(false);
            this.currentOverlay.detach()
        }else{
            this.isopen$.next(true)
            this.currentOverlay.attach(new TemplatePortal(this.panel,this.vc));
        }
    }

    state(des: string, param: number ,i:number) {
        this.placeholder$.next(des);
        this.s.emit(param);
        this.isopen$.next(false);
        this.currentOverlay.detach()
        
    }
}




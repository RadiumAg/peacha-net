import { ModalService } from './../../core/service/modals.service';
import { Component, OnInit } from '@angular/core';
import { VideoPlayerComponent } from 'src/app/components/video-player/video-player.component';

@Component({
    selector: 'ivo-publicity',
    templateUrl: './publicity.component.html',
    styleUrls: ['./publicity.component.less'],
})
export class PublicityComponent implements OnInit {
    constructor(private modal: ModalService) {}

    ngOnInit(): void {}

    playVideo(src:string) {
        this.modal.open(VideoPlayerComponent, {
            src,
        });
    }
}

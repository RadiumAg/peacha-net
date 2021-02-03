import { Component, OnInit } from '@angular/core';
import { VideoPlayerComponent } from 'libs/peacha-core/src/lib/components/video-player/video-player.component';
import { ModalService } from '@peacha-core';

@Component({
    selector: 'ivo-publicity',
    templateUrl: './publicity.component.html',
    styleUrls: ['./publicity.component.less'],
})
export class PublicityComponent implements OnInit {
    constructor(private modal: ModalService) { }

    ngOnInit(): void { }

    playVideo(src: string) {
        this.modal.open(VideoPlayerComponent, {
            src,
        });
    }
}

import { Component, OnInit, Input, Inject } from '@angular/core';
import { ModalRef } from '../../core/service/modals.service';
import { MODAL_DATA_TOKEN } from '../../core/tokens';

@Component({
	selector: 'ivo-video-player',
	template: `<a (click)="close()"></a><video [src]="videoSrc" controls="controls" width="1280" height="720" autoplay></video>`,
	styleUrls: ['./video-player.component.less'],
})
export class VideoPlayerComponent implements OnInit {
	videoSrc = '';
	constructor(@Inject(MODAL_DATA_TOKEN) data: { src: string }, private modal: ModalRef<string>) {
		this.videoSrc = data.src;
	}

	close() {
		this.modal.close('');
	}

	ngOnInit(): void {}
}

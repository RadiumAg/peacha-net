export interface Source {
	getImageData(): ImageData;
}

export class WebCamSource implements Source {
	private _2dContext: CanvasRenderingContext2D;
	private _dummyCanvas: HTMLCanvasElement;
	private _dummyVideo: HTMLVideoElement;

	public get videoElement(): HTMLVideoElement {
		return this._dummyVideo;
	}

	private constructor(private _width: number, private _height: number, private media: MediaStream) {
		this._dummyVideo = document.createElement('video');
		this._dummyVideo.height = 480;
		this._dummyVideo.width = 640;
		this._dummyVideo.srcObject = media;
		this._dummyVideo.play();
		this._dummyCanvas = document.createElement('canvas');
		this._dummyCanvas.height = 480;
		this._dummyCanvas.width = 640;
		this._2dContext = this._dummyCanvas.getContext('2d');
		// document.body.appendChild(this._dummyCanvas);
	}

	public static async create(deviceId?: ConstrainDOMString): Promise<WebCamSource> {
		const _width = 640;
		const _height = 480;
		const mediaStream = await navigator.mediaDevices.getUserMedia({
			video: {
				width: _width,
				height: _height,
				deviceId,
			},
		});
		const webCamSouce = new WebCamSource(_width, _height, mediaStream);
		return webCamSouce;
	}

	public getImageData(): ImageData {
		this._2dContext.drawImage(this._dummyVideo, 0, 0);
		return this._2dContext.getImageData(0, 0, this._width, this._height);
	}

	public release(): void {
		this.media.getTracks().forEach(track => {
			track.stop();
		});
		this._2dContext = null;
		this._dummyCanvas = null;
		this._dummyVideo = null;
	}
}

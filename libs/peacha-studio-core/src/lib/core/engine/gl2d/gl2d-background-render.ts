import { Inject, Injectable } from '@angular/core';
import { SystemBase } from '../ecs';
import { DOM_ELEMENT } from '../ecs/world';
import { getWebGLContext } from '../utils';
import { loadBackground } from './background';
import { Sprite } from './sprite';

@Injectable()
export class GL2dBackGroundRenderContext {
	gl: WebGLRenderingContext;
	programId: WebGLProgram; // シェーダID
	back: Sprite;

	/**
	 * シェーダーを登録する。
	 */
	public createShader(): WebGLProgram {
		// バーテックスシェーダーのコンパイル
		const vertexShaderId = this.gl.createShader(this.gl.VERTEX_SHADER);

		if (vertexShaderId == null) {
			return null;
		}

		const vertexShader: string =
			'precision mediump float;' +
			'attribute vec3 position;' +
			'attribute vec2 uv;' +
			'varying vec2 vuv;' +
			'void main(void)' +
			'{' +
			'   gl_Position = vec4(position, 1.0);' +
			'   vuv = uv;' +
			'}';

		this.gl.shaderSource(vertexShaderId, vertexShader);
		this.gl.compileShader(vertexShaderId);

		// フラグメントシェーダのコンパイル
		const fragmentShaderId = this.gl.createShader(this.gl.FRAGMENT_SHADER);

		if (fragmentShaderId == null) {
			return null;
		}

		const fragmentShader: string =
			'precision mediump float;' +
			'varying vec2 vuv;' +
			'uniform sampler2D texture;' +
			'void main(void)' +
			'{' +
			'   gl_FragColor = texture2D(texture, vuv);' +
			'}';

		this.gl.shaderSource(fragmentShaderId, fragmentShader);
		this.gl.compileShader(fragmentShaderId);

		// プログラムオブジェクトの作成
		const programId = this.gl.createProgram();
		this.gl.attachShader(programId, vertexShaderId);
		this.gl.attachShader(programId, fragmentShaderId);

		this.gl.deleteShader(vertexShaderId);
		this.gl.deleteShader(fragmentShaderId);

		// リンク
		this.gl.linkProgram(programId);

		this.gl.useProgram(programId);

		return programId;
	}

	initBackGroundTexture(canvas: HTMLCanvasElement, texture: WebGLTexture, textureWidth: number, _textureHeight: number) {
		const x: number = canvas.width * 0.5;
		const y: number = canvas.height * 0.5;

		const fwidth = textureWidth * 2.0;
		const fheight = canvas.height * 0.95;
		this.back = new Sprite(x, y, fwidth, fheight, texture, this.gl, canvas);
	}

	createBackImageTexture(
		canvas: HTMLCanvasElement,
		callback: (canvas: HTMLCanvasElement, texture: WebGLTexture, textureWidth: number, _textureHeight: number) => void
	) {
		// eslint-disable-next-line max-len
		// データのオンロードをトリガーにする
		loadBackground(img => {
			const tex: WebGLTexture = this.gl.createTexture();

			// テクスチャを選択
			this.gl.bindTexture(this.gl.TEXTURE_2D, tex);

			// テクスチャにピクセルを書き込む
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

			// テクスチャにピクセルを書き込む
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);

			// ミップマップを生成
			this.gl.generateMipmap(this.gl.TEXTURE_2D);

			// テクスチャをバインド
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);

			callback(canvas, tex, img.width, img.height);
		});
	}
}

@Injectable()
export class GL2DBackgroundRenderSystem extends SystemBase {
	constructor(@Inject(DOM_ELEMENT) public canvas: HTMLCanvasElement, private context: GL2dBackGroundRenderContext) {
		super();
		context.gl = getWebGLContext(canvas);
		context.programId = context.createShader();
		context.createBackImageTexture(canvas, context.initBackGroundTexture.bind(context));
	}

	onDestroy(): void {
		this.context.back.release();
	}

	allBeforeUpdate(): void {
		this.context.gl.clearColor(0, 0, 0, 0);
		this.context.gl.clear(this.context.gl.COLOR_BUFFER_BIT);
	}

	allAfterUpdate(): void {
		this.context.gl.useProgram(this.context.programId);
		this.context.back?.render(this.context.programId);
	}
}

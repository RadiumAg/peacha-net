/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

/**
 * スプライトを実装するクラス
 *
 * テクスチャＩＤ、Rectの管理
 */
export class Sprite {
	_texture: WebGLTexture; // テクスチャ
	_vertexBuffer: WebGLBuffer; // 頂点バッファ
	_uvBuffer: WebGLBuffer; // uv頂点バッファ
	_indexBuffer: WebGLBuffer; // 頂点インデックスバッファ

	_positionLocation: number;
	_uvLocation: number;
	_textureLocation: WebGLUniformLocation;

	_positionArray: Float32Array;
	_uvArray: Float32Array;
	_indexArray: Uint16Array;

	_firstDraw: boolean;

	translateX = 0;
	translateY = 0;
	/**
	 * コンストラクタ
	 * @param x            x座標
	 * @param y            y座標
	 * @param width        横幅
	 * @param height       高さ
	 * @param textureId    テクスチャ
	 */
	constructor(
		x: number,
		y: number,
		public width: number,
		public height: number,
		textureId: WebGLTexture,
		public gl: WebGLRenderingContext,
		public canvas: HTMLCanvasElement
	) {
		this._texture = textureId;
		this._vertexBuffer = null;
		this._uvBuffer = null;
		this._indexBuffer = null;

		this._positionLocation = null;
		this._uvLocation = null;
		this._textureLocation = null;

		this._positionArray = null;
		this._uvArray = null;
		this._indexArray = null;
		this._firstDraw = true;
	}

	/**
	 * 解放する。
	 */
	public release(): void {
		this.gl.deleteTexture(this._texture);
		this._texture = null;

		this.gl.deleteBuffer(this._uvBuffer);
		this._uvBuffer = null;

		this.gl.deleteBuffer(this._vertexBuffer);
		this._vertexBuffer = null;

		this.gl.deleteBuffer(this._indexBuffer);
		this._indexBuffer = null;
	}

	/**
	 * テクスチャを返す
	 */
	public getTexture(): WebGLTexture {
		return this._texture;
	}

	/**
	 * 描画する。
	 * @param programId シェーダープログラム
	 * @param this.canvas 描画するキャンパス情報
	 */
	public render(programId: WebGLProgram): void {
		if (this._texture == null) {
			// ロードが完了していない
			return;
		}

		// 初回描画時
		if (this._firstDraw) {
			// 何番目のattribute変数か取得
			this._positionLocation = this.gl.getAttribLocation(programId, 'position');
			this.gl.enableVertexAttribArray(this._positionLocation);

			this._uvLocation = this.gl.getAttribLocation(programId, 'uv');
			this.gl.enableVertexAttribArray(this._uvLocation);

			// 何番目のuniform変数か取得
			this._textureLocation = this.gl.getUniformLocation(programId, 'texture');

			// uniform属性の登録
			this.gl.uniform1i(this._textureLocation, 0);

			// 頂点バッファ、座標初期化
			{
				// 頂点データ
				this._positionArray = new Float32Array([1, 1, -1, 1, -1, -1, 1, -1]);

				// 頂点バッファを作成
				this._vertexBuffer = this.gl.createBuffer();
			}

			// 頂点インデックスバッファ、初期化
			{
				// インデックスデータ
				this._indexArray = new Uint16Array([0, 1, 2, 3, 2, 0]);

				// インデックスバッファを作成
				this._indexBuffer = this.gl.createBuffer();
			}

			this._firstDraw = false;
		}

		// uvバッファ、座標初期化
		{
			const proportion = this.canvas.width / this.canvas.height;

			this._uvArray = new Float32Array([
				2.0 * proportion + this.translateX,
				0.0 + this.translateY,
				0.0 + this.translateX,
				0.0 + this.translateY,
				0.0 + this.translateX,
				2.0 + this.translateY,
				2.0 * proportion + this.translateX,
				2.0 + this.translateY,
			]);

			this.translateX -= 0.002;
			this.translateY -= 0.002;

			// uvバッファを作成
			this._uvBuffer = this.gl.createBuffer();
		}

		// UV座標登録
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._uvBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this._uvArray, this.gl.STATIC_DRAW);

		// attribute属性を登録
		this.gl.vertexAttribPointer(this._uvLocation, 2, this.gl.FLOAT, false, 0, 0);

		// 頂点座標を登録
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this._positionArray, this.gl.STATIC_DRAW);

		// attribute属性を登録
		this.gl.vertexAttribPointer(this._positionLocation, 2, this.gl.FLOAT, false, 0, 0);

		// 頂点インデックスを作成
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this._indexArray, this.gl.DYNAMIC_DRAW);

		// モデルの描画
		this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
		this.gl.drawElements(this.gl.TRIANGLES, this._indexArray.length, this.gl.UNSIGNED_SHORT, 0);
	}
}

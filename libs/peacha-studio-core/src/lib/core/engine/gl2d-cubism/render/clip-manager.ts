import { CubismRenderer } from './renderer';
import { CubismModel } from '../model';
import { CubismBlendMode } from './blend-mode';
import { CubismTextureColor } from './texture-color';
import { Rect, Matrix44 } from '../../gl2d';

const ColorChannelCount = 4; // 実験時に1チャンネルの場合は1、RGBだけの場合は3、アルファも含める場合は4

const vertexOffset = 0; // メッシュ頂点のオフセット値
const vertexStep = 2; // メッシュ頂点のステップ値

export class CubismClippingManager {
	/**
	 * コンストラクタ
	 */
	public constructor() {
		this._maskRenderTexture = null;
		this._colorBuffer = null;

		this._currentFrameNo = 0;
		this._clippingMaskBufferSize = 256;

		this._clippingContextListForMask = new Array<CubismClippingContext>();
		this._clippingContextListForDraw = new Array<CubismClippingContext>();
		this._channelColors = new Array<CubismTextureColor>();
		this._tmpBoundsOnModel = new Rect();
		this._tmpMatrix = new Matrix44();
		this._tmpMatrixForMask = new Matrix44();
		this._tmpMatrixForDraw = new Matrix44();
		this._maskTexture = null;

		let tmp: CubismTextureColor = new CubismTextureColor();
		tmp.R = 1.0;
		tmp.G = 0.0;
		tmp.B = 0.0;
		tmp.A = 0.0;
		this._channelColors.push(tmp);

		tmp = new CubismTextureColor();
		tmp.R = 0.0;
		tmp.G = 1.0;
		tmp.B = 0.0;
		tmp.A = 0.0;
		this._channelColors.push(tmp);

		tmp = new CubismTextureColor();
		tmp.R = 0.0;
		tmp.G = 0.0;
		tmp.B = 1.0;
		tmp.A = 0.0;
		this._channelColors.push(tmp);

		tmp = new CubismTextureColor();
		tmp.R = 0.0;
		tmp.G = 0.0;
		tmp.B = 0.0;
		tmp.A = 1.0;
		this._channelColors.push(tmp);
	}

	s_fbo: WebGLFramebuffer;

	public _maskRenderTexture: WebGLFramebuffer; // マスク用レンダーテクスチャのアドレス
	public _colorBuffer: WebGLTexture; // マスク用カラーバッファーのアドレス
	public _currentFrameNo: number; // マスクテクスチャに与えるフレーム番号

	public _channelColors: Array<CubismTextureColor>;
	public _maskTexture: CubismRenderTextureResource; // マスク用のテクスチャリソースのリスト
	public _clippingContextListForMask: Array<CubismClippingContext>; // マスク用クリッピングコンテキストのリスト
	public _clippingContextListForDraw: Array<CubismClippingContext>; // 描画用クリッピングコンテキストのリスト
	public _clippingMaskBufferSize: number; // クリッピングマスクのバッファサイズ（初期値:256）

	private _tmpMatrix: Matrix44; // マスク計算用の行列
	private _tmpMatrixForMask: Matrix44; // マスク計算用の行列
	private _tmpMatrixForDraw: Matrix44; // マスク計算用の行列
	private _tmpBoundsOnModel: Rect; // マスク配置計算用の矩形

	gl: WebGLRenderingContext; // WebGLレンダリングコンテキスト
	/**
	 * カラーチャンネル（RGBA）のフラグを取得する
	 * @param channelNo カラーチャンネル（RGBA）の番号（0:R, 1:G, 2:B, 3:A）
	 */
	public getChannelFlagAsColor(channelNo: number): CubismTextureColor {
		return this._channelColors[channelNo];
	}

	/**
	 * テンポラリのレンダーテクスチャのアドレスを取得する
	 * FrameBufferObjectが存在しない場合、新しく生成する
	 *
	 * @return レンダーテクスチャのアドレス
	 */
	public getMaskRenderTexture(): WebGLFramebuffer {
		let ret: WebGLFramebuffer = 0;

		// テンポラリのRenderTextureを取得する
		if (this._maskTexture && this._maskTexture.texture != 0) {
			// 前回使ったものを返す
			this._maskTexture.frameNo = this._currentFrameNo;
			ret = this._maskTexture.texture;
		}

		if (ret == 0) {
			// FrameBufferObjectが存在しない場合、新しく生成する

			// クリッピングバッファサイズを取得
			const size: number = this._clippingMaskBufferSize;

			this._colorBuffer = this.gl.createTexture();
			this.gl.bindTexture(this.gl.TEXTURE_2D, this._colorBuffer);
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, size, size, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
			this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);

			ret = this.gl.createFramebuffer();
			// let s_fbo: WebGLFramebuffer = this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING);
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, ret);
			this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this._colorBuffer, 0);
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.s_fbo);

			this._maskTexture = new CubismRenderTextureResource(this._currentFrameNo, ret);
		}

		return ret;
	}

	/**
	 * WebGLレンダリングコンテキストを設定する
	 * @param gl WebGLレンダリングコンテキスト
	 */
	public setGL(gl: WebGLRenderingContext): void {
		this.gl = gl;
		this.s_fbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
	}

	/**
	 * マスクされる描画オブジェクト群全体を囲む矩形（モデル座標系）を計算する
	 * @param model モデルのインスタンス
	 * @param clippingContext クリッピングマスクのコンテキスト
	 */
	public calcClippedDrawTotalBounds(model: CubismModel, clippingContext: CubismClippingContext): void {
		// 被クリッピングマスク（マスクされる描画オブジェクト）の全体の矩形
		let clippedDrawTotalMinX: number = Number.MAX_VALUE;
		let clippedDrawTotalMinY: number = Number.MAX_VALUE;
		let clippedDrawTotalMaxX: number = Number.MIN_VALUE;
		let clippedDrawTotalMaxY: number = Number.MIN_VALUE;

		// このマスクが実際に必要か判定する
		// このクリッピングを利用する「描画オブジェクト」がひとつでも使用可能であればマスクを生成する必要がある
		const clippedDrawCount: number = clippingContext._clippedDrawableIndexList.length;

		for (let clippedDrawableIndex = 0; clippedDrawableIndex < clippedDrawCount; clippedDrawableIndex++) {
			// マスクを使用する描画オブジェクトの描画される矩形を求める
			const drawableIndex: number = clippingContext._clippedDrawableIndexList[clippedDrawableIndex];

			const drawableVertexCount: number = model.getDrawableVertexCount(drawableIndex);
			const drawableVertexes: Float32Array = model.getDrawableVertices(drawableIndex);

			let minX: number = Number.MAX_VALUE;
			let minY: number = Number.MAX_VALUE;
			let maxX: number = Number.MIN_VALUE;
			let maxY: number = Number.MIN_VALUE;

			const loop: number = drawableVertexCount * vertexStep;
			for (let pi: number = vertexOffset; pi < loop; pi += vertexStep) {
				const x: number = drawableVertexes[pi];
				const y: number = drawableVertexes[pi + 1];

				if (x < minX) {
					minX = x;
				}
				if (x > maxX) {
					maxX = x;
				}
				if (y < minY) {
					minY = y;
				}
				if (y > maxY) {
					maxY = y;
				}
			}

			// 有効な点が一つも取れなかったのでスキップ
			if (minX == Number.MAX_VALUE) {
				continue;
			}

			// 全体の矩形に反映
			if (minX < clippedDrawTotalMinX) {
				clippedDrawTotalMinX = minX;
			}
			if (minY < clippedDrawTotalMinY) {
				clippedDrawTotalMinY = minY;
			}
			if (maxX > clippedDrawTotalMaxX) {
				clippedDrawTotalMaxX = maxX;
			}
			if (maxY > clippedDrawTotalMaxY) {
				clippedDrawTotalMaxY = maxY;
			}

			if (clippedDrawTotalMinX == Number.MAX_VALUE) {
				clippingContext._allClippedDrawRect.x = 0.0;
				clippingContext._allClippedDrawRect.y = 0.0;
				clippingContext._allClippedDrawRect.width = 0.0;
				clippingContext._allClippedDrawRect.height = 0.0;
				clippingContext._isUsing = false;
			} else {
				clippingContext._isUsing = true;
				const w: number = clippedDrawTotalMaxX - clippedDrawTotalMinX;
				const h: number = clippedDrawTotalMaxY - clippedDrawTotalMinY;
				clippingContext._allClippedDrawRect.x = clippedDrawTotalMinX;
				clippingContext._allClippedDrawRect.y = clippedDrawTotalMinY;
				clippingContext._allClippedDrawRect.width = w;
				clippingContext._allClippedDrawRect.height = h;
			}
		}
	}

	/**
	 * デストラクタ相当の処理
	 */
	public release(): void {
		for (let i = 0; i < this._clippingContextListForMask.length; i++) {
			if (this._clippingContextListForMask[i]) {
				this._clippingContextListForMask[i].release();
				this._clippingContextListForMask[i] = void 0;
			}
			this._clippingContextListForMask[i] = null;
		}
		this._clippingContextListForMask = null;

		// _clippingContextListForDrawは_clippingContextListForMaskにあるインスタンスを指している。上記の処理により要素ごとのDELETEは不要。
		for (let i = 0; i < this._clippingContextListForDraw.length; i++) {
			this._clippingContextListForDraw[i] = null;
		}
		this._clippingContextListForDraw = null;

		if (this._maskTexture) {
			this.gl.deleteFramebuffer(this._maskTexture.texture);
			this._maskTexture = null;
		}

		for (let i = 0; i < this._channelColors.length; i++) {
			this._channelColors[i] = null;
		}

		this._channelColors = null;

		// テクスチャ解放
		this.gl.deleteTexture(this._colorBuffer);
		this._colorBuffer = null;
	}

	/**
	 * マネージャの初期化処理
	 * クリッピングマスクを使う描画オブジェクトの登録を行う
	 * @param model モデルのインスタンス
	 * @param drawableCount 描画オブジェクトの数
	 * @param drawableMasks 描画オブジェクトをマスクする描画オブジェクトのインデックスのリスト
	 * @param drawableCounts 描画オブジェクトをマスクする描画オブジェクトの数
	 */
	public initialize(model: CubismModel, drawableCount: number, drawableMasks: Int32Array[], drawableMaskCounts: Int32Array): void {
		// クリッピングマスクを使う描画オブジェクトをすべて登録する
		// クリッピングマスクは、通常数個程度に限定して使うものとする
		for (let i = 0; i < drawableCount; i++) {
			if (drawableMaskCounts[i] <= 0) {
				// クリッピングマスクが使用されていないアートメッシュ（多くの場合使用しない）
				this._clippingContextListForDraw.push(null);
				continue;
			}

			// 既にあるClipContextと同じかチェックする
			let clippingContext: CubismClippingContext = this.findSameClip(drawableMasks[i], drawableMaskCounts[i]);
			if (clippingContext == null) {
				// 同一のマスクが存在していない場合は生成する
				clippingContext = new CubismClippingContext(this, drawableMasks[i], drawableMaskCounts[i]);
				this._clippingContextListForMask.push(clippingContext);
			}

			clippingContext.addClippedDrawable(i);

			this._clippingContextListForDraw.push(clippingContext);
		}
	}

	/**
	 * クリッピングコンテキストを作成する。モデル描画時に実行する。
	 * @param model モデルのインスタンス
	 * @param renderer レンダラのインスタンス
	 */
	public setupClippingContext(model: CubismModel, renderer: CubismRenderer): void {
		this._currentFrameNo++;

		// 全てのクリッピングを用意する
		// 同じクリップ（複数の場合はまとめて一つのクリップ）を使う場合は1度だけ設定する
		let usingClipCount = 0;
		for (let clipIndex = 0; clipIndex < this._clippingContextListForMask.length; clipIndex++) {
			// 1つのクリッピングマスクに関して
			const cc: CubismClippingContext = this._clippingContextListForMask[clipIndex];

			// このクリップを利用する描画オブジェクト群全体を囲む矩形を計算
			this.calcClippedDrawTotalBounds(model, cc);

			if (cc._isUsing) {
				usingClipCount++; // 使用中としてカウント
			}
		}

		// マスク作成処理
		if (usingClipCount > 0) {
			const viewport = [0, 0, this.gl.canvas.width, this.gl.canvas.height];
			// 生成したFrameBufferと同じサイズでビューポートを設定
			this.gl.viewport(0, 0, this._clippingMaskBufferSize, this._clippingMaskBufferSize);

			// マスクをactiveにする
			this._maskRenderTexture = this.getMaskRenderTexture();

			// モデル描画時にDrawMeshNowに渡される変換(モデルtoワールド座標変換)
			//   const modelToWorldF: Matrix44 = renderer.getMvpMatrix();

			renderer.preDraw(); // バッファをクリアする

			// 各マスクのレイアウトを決定していく
			this.setupLayoutBounds(usingClipCount);

			// let s_fbo: WebGLFramebuffer = this.gl.getParameter(this.gl.FRAMEBUFFER_BINDING);
			// ---------- マスク描画処理 ----------
			// マスク用RenderTextureをactiveにセット
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._maskRenderTexture);

			// マスクをクリアする
			// (仮仕様) 1が無効（描かれない）領域、0が有効（描かれる）領域。（シェーダーCd*Csで0に近い値をかけてマスクを作る。1をかけると何も起こらない）
			this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT);

			// 実際にマスクを生成する
			// 全てのマスクをどのようにレイアウトして描くかを決定し、ClipContext, ClippedDrawContextに記憶する
			for (let clipIndex = 0; clipIndex < this._clippingContextListForMask.length; clipIndex++) {
				// --- 実際に1つのマスクを描く ---
				const clipContext: CubismClippingContext = this._clippingContextListForMask[clipIndex];
				const allClipedDrawRect: Rect = clipContext._allClippedDrawRect; // このマスクを使う、すべての描画オブジェクトの論理座標上の囲み矩形
				const layoutBoundsOnTex01: Rect = clipContext._layoutBounds; // この中にマスクを収める

				// モデル座標上の矩形を、適宜マージンを付けて使う
				const MARGIN = 0.05;
				this._tmpBoundsOnModel.setRect(allClipedDrawRect);
				this._tmpBoundsOnModel.expand(allClipedDrawRect.width * MARGIN, allClipedDrawRect.height * MARGIN);
				// ########## 本来は割り当てられた領域の全体を使わず必要最低限のサイズがよい

				// シェーダ用の計算式を求める。回転を考慮しない場合は以下のとおり
				// movePeriod' = movePeriod * scaleX + offX
				//  [[ movePeriod' = (movePeriod - tmpBoundsOnModel.movePeriod)*scale + layoutBoundsOnTex01.movePeriod ]]
				const scaleX: number = layoutBoundsOnTex01.width / this._tmpBoundsOnModel.width;
				const scaleY: number = layoutBoundsOnTex01.height / this._tmpBoundsOnModel.height;

				// マスク生成時に使う行列を求める
				{
					// シェーダに渡す行列を求める <<<<<<<<<<<<<<<<<<<<<<<< 要最適化（逆順に計算すればシンプルにできる）
					this._tmpMatrix.identity();
					{
						// layout0..1 を -1..1に変換
						this._tmpMatrix.translateRelative(-1.0, -1.0);
						this._tmpMatrix.scaleRelative(2.0, 2.0);
					}
					{
						// view to layout0..1
						this._tmpMatrix.translateRelative(layoutBoundsOnTex01.x, layoutBoundsOnTex01.y);
						this._tmpMatrix.scaleRelative(scaleX, scaleY); // new = [translate][scale]
						this._tmpMatrix.translateRelative(-this._tmpBoundsOnModel.x, -this._tmpBoundsOnModel.y);
						// new = [translate][scale][translate]
					}
					// tmpMatrixForMaskが計算結果
					this._tmpMatrixForMask.setMatrix(this._tmpMatrix.getArray());
				}

				// --------- draw時の mask 参照用行列を計算
				{
					// シェーダに渡す行列を求める <<<<<<<<<<<<<<<<<<<<<<<< 要最適化（逆順に計算すればシンプルにできる）
					this._tmpMatrix.identity();
					{
						this._tmpMatrix.translateRelative(layoutBoundsOnTex01.x, layoutBoundsOnTex01.y);
						this._tmpMatrix.scaleRelative(scaleX, scaleY); // new = [translate][scale]
						this._tmpMatrix.translateRelative(-this._tmpBoundsOnModel.x, -this._tmpBoundsOnModel.y);
						// new = [translate][scale][translate]
					}
					this._tmpMatrixForDraw.setMatrix(this._tmpMatrix.getArray());
				}
				clipContext._matrixForMask.setMatrix(this._tmpMatrixForMask.getArray());
				clipContext._matrixForDraw.setMatrix(this._tmpMatrixForDraw.getArray());

				const clipDrawCount: number = clipContext._clippingIdCount;
				for (let i = 0; i < clipDrawCount; i++) {
					const clipDrawIndex: number = clipContext._clippingIdList[i];

					// 頂点情報が更新されておらず、信頼性がない場合は描画をパスする
					if (!model.getDrawableDynamicFlagVertexPositionsDidChange(clipDrawIndex)) {
						continue;
					}

					renderer.setIsCulling(model.getDrawableCulling(clipDrawIndex) != false);

					// 今回専用の変換を適用して描く
					// チャンネルも切り替える必要がある(A,R,G,B)
					renderer.setClippingContextBufferForMask(clipContext);
					renderer.drawMesh(
						model.getDrawableTextureIndices(clipDrawIndex),
						model.getDrawableVertexIndexCount(clipDrawIndex),
						model.getDrawableVertexCount(clipDrawIndex),
						model.getDrawableVertexIndices(clipDrawIndex),
						model.getDrawableVertices(clipDrawIndex),
						model.getDrawableVertexUvs(clipDrawIndex),
						model.getDrawableOpacity(clipDrawIndex),
						CubismBlendMode.CubismBlendMode_Normal, // クリッピングは通常描画を強制
						false // マスク生成時はクリッピングの反転使用は全く関係がない
					);
				}
			}

			// --- 後処理 ---
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.s_fbo); // 描画対象を戻す
			renderer.setClippingContextBufferForMask(null);

			this.gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
		}
	}

	/**
	 * 既にマスクを作っているかを確認
	 * 作っている様であれば該当するクリッピングマスクのインスタンスを返す
	 * 作っていなければNULLを返す
	 * @param drawableMasks 描画オブジェクトをマスクする描画オブジェクトのリスト
	 * @param drawableMaskCounts 描画オブジェクトをマスクする描画オブジェクトの数
	 * @return 該当するクリッピングマスクが存在すればインスタンスを返し、なければNULLを返す
	 */
	public findSameClip(drawableMasks: Int32Array, drawableMaskCounts: number): CubismClippingContext {
		// 作成済みClippingContextと一致するか確認
		for (let i = 0; i < this._clippingContextListForMask.length; i++) {
			const clippingContext: CubismClippingContext = this._clippingContextListForMask[i];
			const count: number = clippingContext._clippingIdCount;

			// 個数が違う場合は別物
			if (count != drawableMaskCounts) {
				continue;
			}

			let sameCount = 0;

			// 同じIDを持つか確認。配列の数が同じなので、一致した個数が同じなら同じ物を持つとする
			for (let j = 0; j < count; j++) {
				const clipId: number = clippingContext._clippingIdList[j];

				for (let k = 0; k < count; k++) {
					if (drawableMasks[k] == clipId) {
						sameCount++;
						break;
					}
				}
			}

			if (sameCount == count) {
				return clippingContext;
			}
		}

		return null; // 見つからなかった
	}

	/**
	 * クリッピングコンテキストを配置するレイアウト
	 * 一つのレンダーテクスチャを極力いっぱいに使ってマスクをレイアウトする
	 * マスクグループの数が4以下ならRGBA各チャンネルに一つずつマスクを配置し、5以上6以下ならRGBAを2,2,1,1と配置する。
	 *
	 * @param usingClipCount 配置するクリッピングコンテキストの数
	 */
	public setupLayoutBounds(usingClipCount: number): void {
		// ひとつのRenderTextureを極力いっぱいに使ってマスクをレイアウトする
		// マスクグループの数が4以下ならRGBA各チャンネルに1つずつマスクを配置し、5以上6以下ならRGBAを2,2,1,1と配置する

		// RGBAを順番に使っていく
		let div: number = usingClipCount / ColorChannelCount; // 1チャンネルに配置する基本のマスク
		let mod: number = usingClipCount % ColorChannelCount; // 余り、この番号のチャンネルまでに一つずつ配分する

		// 小数点は切り捨てる
		div = ~~div;
		mod = ~~mod;

		// RGBAそれぞれのチャンネルを用意していく（0:R, 1:G, 2:B, 3:A）
		let curClipIndex = 0; // 順番に設定していく

		for (let channelNo = 0; channelNo < ColorChannelCount; channelNo++) {
			// このチャンネルにレイアウトする数
			const layoutCount: number = div + (channelNo < mod ? 1 : 0);

			// 分割方法を決定する
			if (layoutCount == 0) {
				// 何もしない
			} else if (layoutCount == 1) {
				// 全てをそのまま使う
				const clipContext: CubismClippingContext = this._clippingContextListForMask[curClipIndex++];
				clipContext._layoutChannelNo = channelNo;
				clipContext._layoutBounds.x = 0.0;
				clipContext._layoutBounds.y = 0.0;
				clipContext._layoutBounds.width = 1.0;
				clipContext._layoutBounds.height = 1.0;
			} else if (layoutCount == 2) {
				for (let i = 0; i < layoutCount; i++) {
					let xpos: number = i % 2;

					// 小数点は切り捨てる
					xpos = ~~xpos;

					const cc: CubismClippingContext = this._clippingContextListForMask[curClipIndex++];
					cc._layoutChannelNo = channelNo;

					cc._layoutBounds.x = xpos * 0.5;
					cc._layoutBounds.y = 0.0;
					cc._layoutBounds.width = 0.5;
					cc._layoutBounds.height = 1.0;
					// UVを2つに分解して使う
				}
			} else if (layoutCount <= 4) {
				// 4分割して使う
				for (let i = 0; i < layoutCount; i++) {
					let xpos: number = i % 2;
					let ypos: number = i / 2;

					// 小数点は切り捨てる
					xpos = ~~xpos;
					ypos = ~~ypos;

					const cc = this._clippingContextListForMask[curClipIndex++];
					cc._layoutChannelNo = channelNo;

					cc._layoutBounds.x = xpos * 0.5;
					cc._layoutBounds.y = ypos * 0.5;
					cc._layoutBounds.width = 0.5;
					cc._layoutBounds.height = 0.5;
				}
			} else if (layoutCount <= 9) {
				// 9分割して使う
				for (let i = 0; i < layoutCount; i++) {
					let xpos = i % 3;
					let ypos = i / 3;

					// 小数点は切り捨てる
					xpos = ~~xpos;
					ypos = ~~ypos;

					const cc: CubismClippingContext = this._clippingContextListForMask[curClipIndex++];
					cc._layoutChannelNo = channelNo;

					cc._layoutBounds.x = xpos / 3.0;
					cc._layoutBounds.y = ypos / 3.0;
					cc._layoutBounds.width = 1.0 / 3.0;
					cc._layoutBounds.height = 1.0 / 3.0;
				}
			} else {
				throw new Error('not supported mask count : ' + layoutCount);
			}
		}
	}

	/**
	 * カラーバッファを取得する
	 * @return カラーバッファ
	 */
	public getColorBuffer(): WebGLTexture {
		return this._colorBuffer;
	}

	/**
	 * 画面描画に使用するクリッピングマスクのリストを取得する
	 * @return 画面描画に使用するクリッピングマスクのリスト
	 */
	public getClippingContextListForDraw(): CubismClippingContext[] {
		return this._clippingContextListForDraw;
	}

	/**
	 * クリッピングマスクバッファのサイズを設定する
	 * @param size クリッピングマスクバッファのサイズ
	 */
	public setClippingMaskBufferSize(size: number): void {
		this._clippingMaskBufferSize = size;
	}

	/**
	 * クリッピングマスクバッファのサイズを取得する
	 * @return クリッピングマスクバッファのサイズ
	 */
	public getClippingMaskBufferSize(): number {
		return this._clippingMaskBufferSize;
	}
}

/**
 * レンダーテクスチャのリソースを定義する構造体
 * クリッピングマスクで使用する
 */
export class CubismRenderTextureResource {
	/**
	 * 引数付きコンストラクタ
	 * @param frameNo レンダラーのフレーム番号
	 * @param texture テクスチャのアドレス
	 */
	public constructor(frameNo: number, texture: WebGLFramebuffer) {
		this.frameNo = frameNo;
		this.texture = texture;
	}

	public frameNo: number; // レンダラのフレーム番号
	public texture: WebGLFramebuffer; // テクスチャのアドレス
}

/**
 * クリッピングマスクのコンテキスト
 */
export class CubismClippingContext {
	/**
	 * 引数付きコンストラクタ
	 */
	public constructor(manager: CubismClippingManager, clippingDrawableIndices: Int32Array, clipCount: number) {
		this._owner = manager;

		// クリップしている（＝マスク用の）Drawableのインデックスリスト
		this._clippingIdList = clippingDrawableIndices;

		// マスクの数
		this._clippingIdCount = clipCount;

		this._allClippedDrawRect = new Rect();
		this._layoutBounds = new Rect();

		this._clippedDrawableIndexList = [];

		this._matrixForMask = new Matrix44();
		this._matrixForDraw = new Matrix44();
	}

	public _isUsing: boolean; // 現在の描画状態でマスクの準備が必要ならtrue
	public readonly _clippingIdList: Int32Array; // クリッピングマスクのIDリスト
	public _clippingIdCount: number; // クリッピングマスクの数
	public _layoutChannelNo: number; // RGBAのいずれのチャンネルにこのクリップを配置するか（0:R, 1:G, 2:B, 3:A）
	public _layoutBounds: Rect; // マスク用チャンネルのどの領域にマスクを入れるか（View座標-1~1, UVは0~1に直す）
	public _allClippedDrawRect: Rect; // このクリッピングで、クリッピングされるすべての描画オブジェクトの囲み矩形（毎回更新）
	public _matrixForMask: Matrix44; // マスクの位置計算結果を保持する行列
	public _matrixForDraw: Matrix44; // 描画オブジェクトの位置計算結果を保持する行列
	public _clippedDrawableIndexList: number[]; // このマスクにクリップされる描画オブジェクトのリスト

	private _owner: CubismClippingManager; // このマスクを管理しているマネージャのインスタンス

	/**
	 * デストラクタ相当の処理
	 */
	public release(): void {
		if (this._layoutBounds != null) {
			this._layoutBounds = null;
		}

		if (this._allClippedDrawRect != null) {
			this._allClippedDrawRect = null;
		}

		if (this._clippedDrawableIndexList != null) {
			this._clippedDrawableIndexList = null;
		}
	}

	/**
	 * このマスクにクリップされる描画オブジェクトを追加する
	 *
	 * @param drawableIndex クリッピング対象に追加する描画オブジェクトのインデックス
	 */
	public addClippedDrawable(drawableIndex: number): void {
		this._clippedDrawableIndexList.push(drawableIndex);
	}

	/**
	 * このマスクを管理するマネージャのインスタンスを取得する
	 * @return クリッピングマネージャのインスタンス
	 */
	public getClippingManager(): CubismClippingManager {
		return this._owner;
	}

	public setGl(gl: WebGLRenderingContext): void {
		this._owner.setGL(gl);
	}
}

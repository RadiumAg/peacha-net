import { CubismClippingManager, CubismClippingContext } from './clip-manager';
import { CubismShaderWebGL } from './webgl-shader';
import { CubismModel } from '../model';
import { CubismBlendMode } from './blend-mode';
import { CubismTextureColor } from './texture-color';
import { GL2DRenderable, Matrix44, Vector2 } from '../../gl2d';

export class CubismRenderer implements GL2DRenderable {

    public constructor(private model: CubismModel, private gl: WebGLRenderingContext, private _textures: Map<number, WebGLTexture>) {
        this._clippingContextBufferForMask = null;
        this._clippingContextBufferForDraw = null;
        if (model.isUsingMasking()) {
            this._clippingManager = new CubismClippingManager(); // クリッピングマスク・バッファ前処理方式を初期化
            this._clippingManager.initialize(
                model,
                model.getDrawableCount(),
                model.getDrawableMasks(),
                model.getDrawableMaskCounts()
            );
            this._clippingManager.setGL(gl);
        }
        CubismShaderWebGL.getInstance(this.id).setGl(gl);
        this.firstDraw = true;
        this._sortedDrawableIndexList = new Array<number>();
        this._bufferData = {
            vertex: null,
            uv: null,
            index: null
        };

        // テクスチャ対応マップの容量を確保しておく
        //   this._textures.prepareCapacity(32, true);


        this._isCulling = false;
        this._isPremultipliedAlpha = false;
        this._anisortopy = 0.0;
        this._modelColor = new CubismTextureColor();

        // 単位行列に初期化
        this._mvpMatrix4x4 = new Matrix44();
        this._mvpMatrix4x4.identity();


    }

    private static SEQ_RENDERER = 0;

    public order = 0;

    private id = CubismRenderer.SEQ_RENDERER++;
    _sortedDrawableIndexList: Array<number>; // 描画オブジェクトのインデックスを描画順に並べたリスト
    _clippingManager: CubismClippingManager; // クリッピングマスク管理オブジェクト
    _clippingContextBufferForMask: CubismClippingContext; // マスクテクスチャに描画するためのクリッピングコンテキスト
    _clippingContextBufferForDraw: CubismClippingContext; // 画面上描画するためのクリッピングコンテキスト
    firstDraw: boolean;
    _bufferData: {
        vertex: WebGLBuffer;
        uv: WebGLBuffer;
        index: WebGLBuffer;
    }; // 頂点バッファデータ


    protected _mvpMatrix4x4: Matrix44; // Model-View-Projection 行列
    protected _modelColor: CubismTextureColor; // モデル自体のカラー（RGBA）
    protected _isCulling: boolean; // カリングが有効ならtrue
    protected _isPremultipliedAlpha: boolean; // 乗算済みαならtrue
    protected _anisortopy: any; // テクスチャの異方性フィルタリングのパラメータ

    /**
     * レンダラが保持する静的なリソースを解放する
     * WebGLの静的なシェーダープログラムを解放する
     */
    public static doStaticRelease(id: number): void {
        CubismShaderWebGL.deleteInstance(id);
    }

    /**
     * クリッピングマスクバッファのサイズを設定する
     * マスク用のFrameBufferを破棄、再作成する為処理コストは高い
     * @param size クリッピングマスクバッファのサイズ
     */
    // public setClippingMaskBufferSize(size: number) {
    //     // FrameBufferのサイズを変更するためにインスタンスを破棄・再作成する
    //     this._clippingManager.release();
    //     this._clippingManager = void 0;
    //     this._clippingManager = null;

    //     this._clippingManager = new CubismClippingManager();

    //     this._clippingManager.setClippingMaskBufferSize(size);

    //     this._clippingManager.initialize(
    //         this.getModel(),
    //         this.getModel().getDrawableCount(),
    //         this.getModel().getDrawableMasks(),
    //         this.getModel().getDrawableMaskCounts()
    //     );
    // }

    /**
     * クリッピングマスクバッファのサイズを取得する
     * @return クリッピングマスクバッファのサイズ
     */
    public getClippingMaskBufferSize(): number {
        return this._clippingManager.getClippingMaskBufferSize();
    }

    /**
     * デストラクタ相当の処理
     */
    public release(): void {
        this._clippingManager?.release();
        this._clippingManager = void 0;
        this._clippingManager = null;

        this.gl.deleteBuffer(this._bufferData.vertex);
        this._bufferData.vertex = null;
        this.gl.deleteBuffer(this._bufferData.uv);
        this._bufferData.uv = null;
        this.gl.deleteBuffer(this._bufferData.index);
        this._bufferData.index = null;
        this._bufferData = null;

        this._textures = null;
    }

    public hit(vec: Vector2): boolean {
        const drawableCount: number = this.model.getDrawableCount();
        const renderOrder: Int32Array = this.model.getDrawableRenderOrders();
        for (let i = 0; i < drawableCount; i++) {
            const d = this.isHit(renderOrder[i], vec.x, vec.y);
            if (d) {
                return true;
            }
        }
        return false;
    }

    public isHit(
        drawIndex: number,
        pointX: number,
        pointY: number
    ): boolean {

        if (drawIndex < 0) {
            return false; // 存在しない場合はfalse
        }

        const count: number = this.model.getDrawableVertexCount(drawIndex);
        const vertices: Float32Array = this.model.getDrawableVertices(drawIndex);
        const icount: number = this.model.getDrawableVertexIndexCount(drawIndex);
        const indices: Uint16Array = this.model.getDrawableVertexIndices(drawIndex);

        let left: number = vertices[0];
        let right: number = vertices[0];
        let top: number = vertices[1];
        let bottom: number = vertices[1];

        // console.log(icount);
        for (let j = 1; j < count; ++j) {
            const x = vertices[0 + j * 2];
            const y = vertices[0 + j * 2 + 1];

            if (x < left) {
                left = x; // Min x
            }

            if (x > right) {
                right = x; // Max x
            }

            if (y < top) {
                top = y; // Min y
            }

            if (y > bottom) {
                bottom = y; // Max y
            }
        }

        const tx: number = pointX;
        const ty: number = (pointY);

        const check = left <= tx && tx <= right && top <= ty && ty <= bottom;
        return check;
        // if (check) {
        //     for (let i = 0; i < icount / 3; i += 3) {
        //         const d = ptInTriangle({
        //             x: pointX,
        //             y: pointY
        //         }, {
        //             x: vertices[indices[i] * 2 + 2],
        //             y: vertices[indices[i] * 2 + 3]
        //         }, {
        //             x: vertices[indices[i + 1] * 2 + 2],
        //             y: vertices[indices[i + 1] * 2 + 3]
        //         }, {
        //             x: vertices[indices[i + 2] * 2 + 2],
        //             y: vertices[indices[i + 2] * 2 + 3]
        //         });
        //         if (!d) {
        //             return false;
        //         }
        //     }
        //     return true;
        // }
        // return false;
    }

    /**
     * モデルを描画する実際の処理
     */
    public draw(mvp: Matrix44): void {
        const model = this.model;
        this._mvpMatrix4x4.setMatrix(mvp.matrix);

        // ------------ クリッピングマスク・バッファ前処理方式の場合 ------------
        if (this._clippingManager != null) {
            this.preDraw();
            this._clippingManager.setupClippingContext(model, this);
        }

        // 上記クリッピング処理内でも一度PreDrawを呼ぶので注意!!
        this.preDraw();

        const drawableCount: number = model.getDrawableCount();
        const renderOrder: Int32Array = model.getDrawableRenderOrders();

        // インデックスを描画順でソート
        for (let i = 0; i < drawableCount; ++i) {
            const order: number = renderOrder[i];
            this._sortedDrawableIndexList[order] = i;
        }

        // 描画
        for (let i = 0; i < drawableCount; ++i) {
            const drawableIndex: number = this._sortedDrawableIndexList[i];

            // Drawableが表示状態でなければ処理をパスする
            if (!model.getDrawableDynamicFlagIsVisible(drawableIndex)) {
                continue;
            }

            // クリッピングマスクをセットする
            this.setClippingContextBufferForDraw(
                this._clippingManager != null
                    ? this._clippingManager
                        .getClippingContextListForDraw()[drawableIndex]
                    : null
            );

            this.setIsCulling(model.getDrawableCulling(drawableIndex));

            this.drawMesh(
                model.getDrawableTextureIndices(drawableIndex),
                model.getDrawableVertexIndexCount(drawableIndex),
                model.getDrawableVertexCount(drawableIndex),
                model.getDrawableVertexIndices(drawableIndex),
                model.getDrawableVertices(drawableIndex),
                model.getDrawableVertexUvs(drawableIndex),
                model.getDrawableOpacity(drawableIndex),
                model.getDrawableBlendMode(drawableIndex),
                model.getDrawableInvertedMaskBit(drawableIndex)
            );
        }
    }

    /**
     * [オーバーライド]
     * 描画オブジェクト（アートメッシュ）を描画する。
     * ポリゴンメッシュとテクスチャ番号をセットで渡す。
     * @param textureNo 描画するテクスチャ番号
     * @param indexCount 描画オブジェクトのインデックス値
     * @param vertexCount ポリゴンメッシュの頂点数
     * @param indexArray ポリゴンメッシュのインデックス配列
     * @param vertexArray ポリゴンメッシュの頂点配列
     * @param uvArray uv配列
     * @param opacity 不透明度
     * @param colorBlendMode カラー合成タイプ
     * @param invertedMask マスク使用時のマスクの反転使用
     */
    public drawMesh(
        textureNo: number,
        indexCount: number,
        vertexCount: number,
        indexArray: Uint16Array,
        vertexArray: Float32Array,
        uvArray: Float32Array,
        opacity: number,
        colorBlendMode: CubismBlendMode,
        invertedMask: boolean
    ): void {
        // 裏面描画の有効・無効
        if (this.isCulling()) {
            this.gl.enable(this.gl.CULL_FACE);
        } else {
            this.gl.disable(this.gl.CULL_FACE);
        }

        this.gl.frontFace(this.gl.CCW); // Cubism SDK OpenGLはマスク・アートメッシュ共にCCWが表面

        const modelColorRGBA: CubismTextureColor = this.getModelColor();

        if (this.getClippingContextBufferForMask() == null) {
            // マスク生成時以外
            modelColorRGBA.A *= opacity;
            if (this.isPremultipliedAlpha()) {
                modelColorRGBA.R *= modelColorRGBA.A;
                modelColorRGBA.G *= modelColorRGBA.A;
                modelColorRGBA.B *= modelColorRGBA.A;
            }
        }

        let drawtexture: WebGLTexture; // シェーダに渡すテクスチャ

        // テクスチャマップからバインド済みテクスチャＩＤを取得
        // バインドされていなければダミーのテクスチャIDをセットする
        if (this._textures.has(textureNo)) {
            drawtexture = this._textures.get(textureNo);
        } else {
            drawtexture = null;
        }

        CubismShaderWebGL.getInstance(this.id).setupShaderProgram(
            this,
            drawtexture,
            vertexCount,
            vertexArray,
            indexArray,
            uvArray,
            this._bufferData,
            opacity,
            colorBlendMode,
            modelColorRGBA,
            this.isPremultipliedAlpha(),
            this.getMvpMatrix(),
            invertedMask
        );

        // ポリゴンメッシュを描画する
        this.gl.drawElements(
            this.gl.TRIANGLES,
            indexCount,
            this.gl.UNSIGNED_SHORT,
            0
        );

        // 後処理
        this.gl.useProgram(null);
        this.setClippingContextBufferForDraw(null);
        this.setClippingContextBufferForMask(null);
    }

    /**
     * 描画開始時の追加処理
     * モデルを描画する前にクリッピングマスクに必要な処理を実装している
     */
    public preDraw(): void {
        if (this.firstDraw) {
            this.firstDraw = false;

            // 拡張機能を有効にする
            this._anisortopy =
                this.gl.getExtension('EXT_texture_filter_anisotropic') ||
                this.gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
                this.gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
        }

        this.gl.disable(this.gl.SCISSOR_TEST);
        this.gl.disable(this.gl.STENCIL_TEST);
        this.gl.disable(this.gl.DEPTH_TEST);

        // カリング（1.0beta3）
        this.gl.frontFace(this.gl.CW);

        this.gl.enable(this.gl.BLEND);
        this.gl.colorMask(true, true, true, true);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null); // 前にバッファがバインドされていたら破棄する必要がある
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    /**
     * マスクテクスチャに描画するクリッピングコンテキストをセットする
     */
    public setClippingContextBufferForMask(clip: CubismClippingContext): void {
        this._clippingContextBufferForMask = clip;
    }

    /**
     * マスクテクスチャに描画するクリッピングコンテキストを取得する
     * @return マスクテクスチャに描画するクリッピングコンテキスト
     */
    public getClippingContextBufferForMask(): CubismClippingContext {
        return this._clippingContextBufferForMask;
    }

    /**
     * 画面上に描画するクリッピングコンテキストをセットする
     */
    public setClippingContextBufferForDraw(clip: CubismClippingContext): void {
        this._clippingContextBufferForDraw = clip;
    }

    /**
     * 画面上に描画するクリッピングコンテキストを取得する
     * @return 画面上に描画するクリッピングコンテキスト
     */
    public getClippingContextBufferForDraw(): CubismClippingContext {
        return this._clippingContextBufferForDraw;
    }

    /**
     * Model-View-Projection 行列を取得する
     * @return Model-View-Projection 行列
     */
    public getMvpMatrix(): Matrix44 {
        return this._mvpMatrix4x4;
    }

    /**
     * モデルの色をセットする
     * 各色0.0~1.0の間で指定する（1.0が標準の状態）
     * @param red 赤チャンネルの値
     * @param green 緑チャンネルの値
     * @param blue 青チャンネルの値
     * @param alpha αチャンネルの値
     */
    public setModelColor(
        red: number,
        green: number,
        blue: number,
        alpha: number
    ): void {
        if (red < 0.0) {
            red = 0.0;
        } else if (red > 1.0) {
            red = 1.0;
        }

        if (green < 0.0) {
            green = 0.0;
        } else if (green > 1.0) {
            green = 1.0;
        }

        if (blue < 0.0) {
            blue = 0.0;
        } else if (blue > 1.0) {
            blue = 1.0;
        }

        if (alpha < 0.0) {
            alpha = 0.0;
        } else if (alpha > 1.0) {
            alpha = 1.0;
        }

        this._modelColor.R = red;
        this._modelColor.G = green;
        this._modelColor.B = blue;
        this._modelColor.A = alpha;
    }

    /**
     * モデルの色を取得する
     * 各色0.0~1.0の間で指定する(1.0が標準の状態)
     *
     * @return RGBAのカラー情報
     */
    public getModelColor(): CubismTextureColor {
        return {
            R: this._modelColor.R,
            G: this._modelColor.G,
            B: this._modelColor.B,
            A: this._modelColor.A
        };
    }

    /**
     * 乗算済みαの有効・無効をセットする
     * 有効にするならtrue、無効にするならfalseをセットする
     */
    public setIsPremultipliedAlpha(enable: boolean): void {
        this._isPremultipliedAlpha = enable;
    }

    /**
     * 乗算済みαの有効・無効を取得する
     * @return true 乗算済みのα有効
     * @return false 乗算済みのα無効
     */
    public isPremultipliedAlpha(): boolean {
        return this._isPremultipliedAlpha;
    }

    /**
     * カリング（片面描画）の有効・無効をセットする。
     * 有効にするならtrue、無効にするならfalseをセットする
     */
    public setIsCulling(culling: boolean): void {
        this._isCulling = culling;
    }

    /**
     * カリング（片面描画）の有効・無効を取得する。
     * @return true カリング有効
     * @return false カリング無効
     */
    public isCulling(): boolean {
        return this._isCulling;
    }

    /**
     * テクスチャの異方性フィルタリングのパラメータをセットする
     * パラメータ値の影響度はレンダラの実装に依存する
     * @param n パラメータの値
     */
    public setAnisotropy(n: number): void {
        this._anisortopy = n;
    }

    /**
     * テクスチャの異方性フィルタリングのパラメータをセットする
     * @return 異方性フィルタリングのパラメータ
     */
    public getAnisotropy(): number {
        return this._anisortopy;
    }
}

function ptInTriangle(p, p0, p1, p2): boolean {
    const A = 1 / 2 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
    const sign = A < 0 ? -1 : 1;
    const s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
    const t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;

    return s > 0 && t > 0 && (s + t) < 2 * A * sign;
}

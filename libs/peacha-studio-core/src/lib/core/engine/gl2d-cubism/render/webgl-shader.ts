
import { CubismRenderer } from './renderer';
import { Matrix44, Rect } from '../../gl2d';
import { CubismBlendMode } from './blend-mode';
import { CubismTextureColor } from './texture-color';

// let CubismShaderWebGL.s_instance: CubismShaderWebGL;
const shaderCount = 10; // シェーダーの数 = マスク生成用 + (通常用 + 加算 + 乗算) * (マスク無の乗算済アルファ対応版 + マスク有の乗算済アルファ対応版 + マスク有反転の乗算済アルファ対応版)

export enum ShaderNames {
  // SetupMask
  ShaderNames_SetupMask,

  // Normal
  ShaderNames_NormalPremultipliedAlpha,
  ShaderNames_NormalMaskedPremultipliedAlpha,
  ShaderNames_NomralMaskedInvertedPremultipliedAlpha,

  // Add
  ShaderNames_AddPremultipliedAlpha,
  ShaderNames_AddMaskedPremultipliedAlpha,
  ShaderNames_AddMaskedPremultipliedAlphaInverted,

  // Mult
  ShaderNames_MultPremultipliedAlpha,
  ShaderNames_MultMaskedPremultipliedAlpha,
  ShaderNames_MultMaskedPremultipliedAlphaInverted
}

/**
 * WebGL用のシェーダープログラムを生成・破棄するクラス
 * シングルトンなクラスであり、CubismShaderWebGL.getInstanceからアクセスする。
 */
export class CubismShaderWebGL {

  /**
   * privateなコンストラクタ
   */
  private constructor() {
    this._shaderSets = new Array<CubismShaderSet>();
  }

  private static s_instance: {
    [id: number]: CubismShaderWebGL
  } = {};

  _shaderSets: Array<CubismShaderSet>; // ロードしたシェーダープログラムを保持する変数
  gl: WebGLRenderingContext; // webglコンテキスト

  /**
   * 单例模式
   * @return インスタンス
   */
  public static getInstance(id: number): CubismShaderWebGL {
    if (!CubismShaderWebGL.s_instance[id]) {
      CubismShaderWebGL.s_instance[id] = new CubismShaderWebGL();
    }
    return CubismShaderWebGL.s_instance[id];
  }

  /**
   * インスタンスを開放する（シングルトン）
   */
  public static deleteInstance(id: number): void {
    if (CubismShaderWebGL.s_instance[id]) {
      CubismShaderWebGL.s_instance[id].release();
      CubismShaderWebGL.s_instance[id] = null;
    }
  }

  /**
   * デストラクタ相当の処理
   */
  public release(): void {
    this.releaseShaderProgram();
  }

  /**
   * シェーダープログラムの一連のセットアップを実行する
   * @param renderer レンダラのインスタンス
   * @param textureId GPUのテクスチャID
   * @param vertexCount ポリゴンメッシュの頂点数
   * @param vertexArray ポリゴンメッシュの頂点配列
   * @param indexArray インデックスバッファの頂点配列
   * @param uvArray uv配列
   * @param opacity 不透明度
   * @param colorBlendMode カラーブレンディングのタイプ
   * @param baseColor ベースカラー
   * @param isPremultipliedAlpha 乗算済みアルファかどうか
   * @param matrix4x4 Model-View-Projection行列
   * @param invertedMask マスクを反転して使用するフラグ
   */
  public setupShaderProgram(
    renderer: CubismRenderer,
    textureId: WebGLTexture,
    vertexCount: number,
    vertexArray: Float32Array,
    indexArray: Uint16Array,
    uvArray: Float32Array,
    bufferData: {
      vertex: WebGLBuffer;
      uv: WebGLBuffer;
      index: WebGLBuffer;
    },
    opacity: number,
    colorBlendMode: CubismBlendMode,
    baseColor: CubismTextureColor,
    isPremultipliedAlpha: boolean,
    matrix4x4: Matrix44,
    invertedMask: boolean
  ): void {
    if (!isPremultipliedAlpha) {
      // CubismLogError('NoPremultipliedAlpha is not allowed');
    }

    if (this._shaderSets.length == 0) {
      this.generateShaders();
    }

    // Blending
    let SRC_COLOR: number;
    let DST_COLOR: number;
    let SRC_ALPHA: number;
    let DST_ALPHA: number;

    if (renderer.getClippingContextBufferForMask() != null) {
      // マスク生成時
      const shaderSet: CubismShaderSet = this._shaderSets[ShaderNames.ShaderNames_SetupMask];
      this.gl.useProgram(shaderSet.shaderProgram);

      // テクスチャ設定
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, textureId);
      this.gl.uniform1i(shaderSet.samplerTexture0Location, 0);

      // 頂点配列の設定(VBO)
      if (bufferData.vertex == null) {
        bufferData.vertex = this.gl.createBuffer();
      }
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferData.vertex);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        vertexArray,
        this.gl.DYNAMIC_DRAW
      );
      this.gl.enableVertexAttribArray(shaderSet.attributePositionLocation);
      this.gl.vertexAttribPointer(
        shaderSet.attributePositionLocation,
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      );

      // テクスチャ頂点の設定
      if (bufferData.uv == null) {
        bufferData.uv = this.gl.createBuffer();
      }
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferData.uv);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, uvArray, this.gl.DYNAMIC_DRAW);
      this.gl.enableVertexAttribArray(shaderSet.attributeTexCoordLocation);
      this.gl.vertexAttribPointer(
        shaderSet.attributeTexCoordLocation,
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      );

      // チャンネル
      const channelNo: number = renderer.getClippingContextBufferForMask()
        ._layoutChannelNo;
      const colorChannel: CubismTextureColor = renderer
        .getClippingContextBufferForMask()
        .getClippingManager()
        .getChannelFlagAsColor(channelNo);
      this.gl.uniform4f(
        shaderSet.uniformChannelFlagLocation,
        colorChannel.R,
        colorChannel.G,
        colorChannel.B,
        colorChannel.A
      );

      this.gl.uniformMatrix4fv(
        shaderSet.uniformClipMatrixLocation,
        false,
        renderer.getClippingContextBufferForMask()._matrixForMask.getArray()
      );

      const rect: Rect = renderer.getClippingContextBufferForMask()
        ._layoutBounds;

      this.gl.uniform4f(
        shaderSet.uniformBaseColorLocation,
        rect.x * 2.0 - 1.0,
        rect.y * 2.0 - 1.0,
        rect.getRight() * 2.0 - 1.0,
        rect.getBottom() * 2.0 - 1.0
      );

      SRC_COLOR = this.gl.ZERO;
      DST_COLOR = this.gl.ONE_MINUS_SRC_COLOR;
      SRC_ALPHA = this.gl.ZERO;
      DST_ALPHA = this.gl.ONE_MINUS_SRC_ALPHA;
    } // マスク生成以外の場合
    else {
      const masked: boolean =
        renderer.getClippingContextBufferForDraw() != null; // この描画オブジェクトはマスク対象か
      const offset: number = masked ? (invertedMask ? 2 : 1) : 0;

      let shaderSet: CubismShaderSet = null;

      switch (colorBlendMode) {
        case CubismBlendMode.CubismBlendMode_Normal:
        default:
          shaderSet = this._shaderSets[
            ShaderNames.ShaderNames_NormalPremultipliedAlpha + offset
          ];
          SRC_COLOR = this.gl.ONE;
          DST_COLOR = this.gl.ONE_MINUS_SRC_ALPHA;
          SRC_ALPHA = this.gl.ONE;
          DST_ALPHA = this.gl.ONE_MINUS_SRC_ALPHA;
          break;

        case CubismBlendMode.CubismBlendMode_Additive:
          shaderSet = this._shaderSets[
            ShaderNames.ShaderNames_AddPremultipliedAlpha + offset
          ];
          SRC_COLOR = this.gl.ONE;
          DST_COLOR = this.gl.ONE;
          SRC_ALPHA = this.gl.ZERO;
          DST_ALPHA = this.gl.ONE;
          break;

        case CubismBlendMode.CubismBlendMode_Multiplicative:
          shaderSet = this._shaderSets[
            ShaderNames.ShaderNames_MultPremultipliedAlpha + offset
          ];
          SRC_COLOR = this.gl.DST_COLOR;
          DST_COLOR = this.gl.ONE_MINUS_SRC_ALPHA;
          SRC_ALPHA = this.gl.ZERO;
          DST_ALPHA = this.gl.ONE;
          break;
      }

      this.gl.useProgram(shaderSet.shaderProgram);

      // 頂点配列の設定
      if (bufferData.vertex == null) {
        bufferData.vertex = this.gl.createBuffer();
      }
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferData.vertex);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        vertexArray,
        this.gl.DYNAMIC_DRAW
      );
      this.gl.enableVertexAttribArray(shaderSet.attributePositionLocation);
      this.gl.vertexAttribPointer(
        shaderSet.attributePositionLocation,
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      );

      // テクスチャ頂点の設定
      if (bufferData.uv == null) {
        bufferData.uv = this.gl.createBuffer();
      }
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferData.uv);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, uvArray, this.gl.DYNAMIC_DRAW);
      this.gl.enableVertexAttribArray(shaderSet.attributeTexCoordLocation);
      this.gl.vertexAttribPointer(
        shaderSet.attributeTexCoordLocation,
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      );

      if (masked) {
        this.gl.activeTexture(this.gl.TEXTURE1);
        const tex: WebGLTexture = renderer
          .getClippingContextBufferForDraw()
          .getClippingManager()
          .getColorBuffer();
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.uniform1i(shaderSet.samplerTexture1Location, 1);

        // view座標をClippingContextの座標に変換するための行列を設定
        this.gl.uniformMatrix4fv(
          shaderSet.uniformClipMatrixLocation,
          false,
          renderer.getClippingContextBufferForDraw()._matrixForDraw.getArray()
        );

        // 使用するカラーチャンネルを設定
        const channelNo: number = renderer.getClippingContextBufferForDraw()
          ._layoutChannelNo;
        const colorChannel: CubismTextureColor = renderer
          .getClippingContextBufferForDraw()
          .getClippingManager()
          .getChannelFlagAsColor(channelNo);
        this.gl.uniform4f(
          shaderSet.uniformChannelFlagLocation,
          colorChannel.R,
          colorChannel.G,
          colorChannel.B,
          colorChannel.A
        );
      }

      // テクスチャ設定
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, textureId);
      this.gl.uniform1i(shaderSet.samplerTexture0Location, 0);

      // 座標変換
      this.gl.uniformMatrix4fv(
        shaderSet.uniformMatrixLocation,
        false,
        matrix4x4.getArray()
      );

      this.gl.uniform4f(
        shaderSet.uniformBaseColorLocation,
        baseColor.R,
        baseColor.G,
        baseColor.B,
        baseColor.A
      );
    }

    // IBOを作成し、データを転送
    if (bufferData.index == null) {
      bufferData.index = this.gl.createBuffer();
    }
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, bufferData.index);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      indexArray,
      this.gl.DYNAMIC_DRAW
    );
    this.gl.blendFuncSeparate(SRC_COLOR, DST_COLOR, SRC_ALPHA, DST_ALPHA);
  }

  /**
   * シェーダープログラムを解放する
   */
  public releaseShaderProgram(): void {
    for (let i = 0; i < this._shaderSets.length; i++) {
      this.gl.deleteProgram(this._shaderSets[i].shaderProgram);
      this._shaderSets[i].shaderProgram = 0;
      this._shaderSets[i] = void 0;
      this._shaderSets[i] = null;
    }
  }

  /**
   * シェーダープログラムを初期化する
   * @param vertShaderSrc 頂点シェーダのソース
   * @param fragShaderSrc フラグメントシェーダのソース
   */
  public generateShaders(): void {
    for (let i = 0; i < shaderCount; i++) {
      this._shaderSets.push(new CubismShaderSet());
    }

    this._shaderSets[0].shaderProgram = this.loadShaderProgram(
      vertexShaderSrcSetupMask,
      fragmentShaderSrcsetupMask
    );

    this._shaderSets[1].shaderProgram = this.loadShaderProgram(
      vertexShaderSrc,
      fragmentShaderSrcPremultipliedAlpha
    );
    this._shaderSets[2].shaderProgram = this.loadShaderProgram(
      vertexShaderSrcMasked,
      fragmentShaderSrcMaskPremultipliedAlpha
    );
    this._shaderSets[3].shaderProgram = this.loadShaderProgram(
      vertexShaderSrcMasked,
      fragmentShaderSrcMaskInvertedPremultipliedAlpha
    );

    // 加算も通常と同じシェーダーを利用する
    this._shaderSets[4].shaderProgram = this._shaderSets[1].shaderProgram;
    this._shaderSets[5].shaderProgram = this._shaderSets[2].shaderProgram;
    this._shaderSets[6].shaderProgram = this._shaderSets[3].shaderProgram;

    // 乗算も通常と同じシェーダーを利用する
    this._shaderSets[7].shaderProgram = this._shaderSets[1].shaderProgram;
    this._shaderSets[8].shaderProgram = this._shaderSets[2].shaderProgram;
    this._shaderSets[9].shaderProgram = this._shaderSets[3].shaderProgram;

    // SetupMask
    this._shaderSets[0].attributePositionLocation = this.gl.getAttribLocation(
      this._shaderSets[0].shaderProgram,
      'a_position'
    );
    this._shaderSets[0].attributeTexCoordLocation = this.gl.getAttribLocation(
      this._shaderSets[0].shaderProgram,
      'a_texCoord'
    );
    this._shaderSets[0].samplerTexture0Location = this.gl.getUniformLocation(
      this._shaderSets[0].shaderProgram,
      's_texture0'
    );
    this._shaderSets[0].uniformClipMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[0].shaderProgram,
      'u_clipMatrix'
    );
    this._shaderSets[0].uniformChannelFlagLocation = this.gl.getUniformLocation(
      this._shaderSets[0].shaderProgram,
      'u_channelFlag'
    );
    this._shaderSets[0].uniformBaseColorLocation = this.gl.getUniformLocation(
      this._shaderSets[0].shaderProgram,
      'u_baseColor'
    );

    // 通常（PremultipliedAlpha）
    this._shaderSets[1].attributePositionLocation = this.gl.getAttribLocation(
      this._shaderSets[1].shaderProgram,
      'a_position'
    );
    this._shaderSets[1].attributeTexCoordLocation = this.gl.getAttribLocation(
      this._shaderSets[1].shaderProgram,
      'a_texCoord'
    );
    this._shaderSets[1].samplerTexture0Location = this.gl.getUniformLocation(
      this._shaderSets[1].shaderProgram,
      's_texture0'
    );
    this._shaderSets[1].uniformMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[1].shaderProgram,
      'u_matrix'
    );
    this._shaderSets[1].uniformBaseColorLocation = this.gl.getUniformLocation(
      this._shaderSets[1].shaderProgram,
      'u_baseColor'
    );

    // 通常（クリッピング、PremultipliedAlpha）
    this._shaderSets[2].attributePositionLocation = this.gl.getAttribLocation(
      this._shaderSets[2].shaderProgram,
      'a_position'
    );
    this._shaderSets[2].attributeTexCoordLocation = this.gl.getAttribLocation(
      this._shaderSets[2].shaderProgram,
      'a_texCoord'
    );
    this._shaderSets[2].samplerTexture0Location = this.gl.getUniformLocation(
      this._shaderSets[2].shaderProgram,
      's_texture0'
    );
    this._shaderSets[2].samplerTexture1Location = this.gl.getUniformLocation(
      this._shaderSets[2].shaderProgram,
      's_texture1'
    );
    this._shaderSets[2].uniformMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[2].shaderProgram,
      'u_matrix'
    );
    this._shaderSets[2].uniformClipMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[2].shaderProgram,
      'u_clipMatrix'
    );
    this._shaderSets[2].uniformChannelFlagLocation = this.gl.getUniformLocation(
      this._shaderSets[2].shaderProgram,
      'u_channelFlag'
    );
    this._shaderSets[2].uniformBaseColorLocation = this.gl.getUniformLocation(
      this._shaderSets[2].shaderProgram,
      'u_baseColor'
    );

    // 通常（クリッピング・反転, PremultipliedAlpha）
    this._shaderSets[3].attributePositionLocation = this.gl.getAttribLocation(
      this._shaderSets[3].shaderProgram,
      'a_position'
    );
    this._shaderSets[3].attributeTexCoordLocation = this.gl.getAttribLocation(
      this._shaderSets[3].shaderProgram,
      'a_texCoord'
    );
    this._shaderSets[3].samplerTexture0Location = this.gl.getUniformLocation(
      this._shaderSets[3].shaderProgram,
      's_texture0'
    );
    this._shaderSets[3].samplerTexture1Location = this.gl.getUniformLocation(
      this._shaderSets[3].shaderProgram,
      's_texture1'
    );
    this._shaderSets[3].uniformMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[3].shaderProgram,
      'u_matrix'
    );
    this._shaderSets[3].uniformClipMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[3].shaderProgram,
      'u_clipMatrix'
    );
    this._shaderSets[3].uniformChannelFlagLocation = this.gl.getUniformLocation(
      this._shaderSets[3].shaderProgram,
      'u_channelFlag'
    );
    this._shaderSets[3].uniformBaseColorLocation = this.gl.getUniformLocation(
      this._shaderSets[3].shaderProgram,
      'u_baseColor'
    );

    // 加算（PremultipliedAlpha）
    this._shaderSets[4].attributePositionLocation = this.gl.getAttribLocation(
      this._shaderSets[4].shaderProgram,
      'a_position'
    );
    this._shaderSets[4].attributeTexCoordLocation = this.gl.getAttribLocation(
      this._shaderSets[4].shaderProgram,
      'a_texCoord'
    );
    this._shaderSets[4].samplerTexture0Location = this.gl.getUniformLocation(
      this._shaderSets[4].shaderProgram,
      's_texture0'
    );
    this._shaderSets[4].uniformMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[4].shaderProgram,
      'u_matrix'
    );
    this._shaderSets[4].uniformBaseColorLocation = this.gl.getUniformLocation(
      this._shaderSets[4].shaderProgram,
      'u_baseColor'
    );

    // 加算（クリッピング、PremultipliedAlpha）
    this._shaderSets[5].attributePositionLocation = this.gl.getAttribLocation(
      this._shaderSets[5].shaderProgram,
      'a_position'
    );
    this._shaderSets[5].attributeTexCoordLocation = this.gl.getAttribLocation(
      this._shaderSets[5].shaderProgram,
      'a_texCoord'
    );
    this._shaderSets[5].samplerTexture0Location = this.gl.getUniformLocation(
      this._shaderSets[5].shaderProgram,
      's_texture0'
    );
    this._shaderSets[5].samplerTexture1Location = this.gl.getUniformLocation(
      this._shaderSets[5].shaderProgram,
      's_texture1'
    );
    this._shaderSets[5].uniformMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[5].shaderProgram,
      'u_matrix'
    );
    this._shaderSets[5].uniformClipMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[5].shaderProgram,
      'u_clipMatrix'
    );
    this._shaderSets[5].uniformChannelFlagLocation = this.gl.getUniformLocation(
      this._shaderSets[5].shaderProgram,
      'u_channelFlag'
    );
    this._shaderSets[5].uniformBaseColorLocation = this.gl.getUniformLocation(
      this._shaderSets[5].shaderProgram,
      'u_baseColor'
    );

    // 加算（クリッピング・反転、PremultipliedAlpha）
    this._shaderSets[6].attributePositionLocation = this.gl.getAttribLocation(
      this._shaderSets[6].shaderProgram,
      'a_position'
    );
    this._shaderSets[6].attributeTexCoordLocation = this.gl.getAttribLocation(
      this._shaderSets[6].shaderProgram,
      'a_texCoord'
    );
    this._shaderSets[6].samplerTexture0Location = this.gl.getUniformLocation(
      this._shaderSets[6].shaderProgram,
      's_texture0'
    );
    this._shaderSets[6].samplerTexture1Location = this.gl.getUniformLocation(
      this._shaderSets[6].shaderProgram,
      's_texture1'
    );
    this._shaderSets[6].uniformMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[6].shaderProgram,
      'u_matrix'
    );
    this._shaderSets[6].uniformClipMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[6].shaderProgram,
      'u_clipMatrix'
    );
    this._shaderSets[6].uniformChannelFlagLocation = this.gl.getUniformLocation(
      this._shaderSets[6].shaderProgram,
      'u_channelFlag'
    );
    this._shaderSets[6].uniformBaseColorLocation = this.gl.getUniformLocation(
      this._shaderSets[6].shaderProgram,
      'u_baseColor'
    );

    // 乗算（PremultipliedAlpha）
    this._shaderSets[7].attributePositionLocation = this.gl.getAttribLocation(
      this._shaderSets[7].shaderProgram,
      'a_position'
    );
    this._shaderSets[7].attributeTexCoordLocation = this.gl.getAttribLocation(
      this._shaderSets[7].shaderProgram,
      'a_texCoord'
    );
    this._shaderSets[7].samplerTexture0Location = this.gl.getUniformLocation(
      this._shaderSets[7].shaderProgram,
      's_texture0'
    );
    this._shaderSets[7].uniformMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[7].shaderProgram,
      'u_matrix'
    );
    this._shaderSets[7].uniformBaseColorLocation = this.gl.getUniformLocation(
      this._shaderSets[7].shaderProgram,
      'u_baseColor'
    );

    // 乗算（クリッピング、PremultipliedAlpha）
    this._shaderSets[8].attributePositionLocation = this.gl.getAttribLocation(
      this._shaderSets[8].shaderProgram,
      'a_position'
    );
    this._shaderSets[8].attributeTexCoordLocation = this.gl.getAttribLocation(
      this._shaderSets[8].shaderProgram,
      'a_texCoord'
    );
    this._shaderSets[8].samplerTexture0Location = this.gl.getUniformLocation(
      this._shaderSets[8].shaderProgram,
      's_texture0'
    );
    this._shaderSets[8].samplerTexture1Location = this.gl.getUniformLocation(
      this._shaderSets[8].shaderProgram,
      's_texture1'
    );
    this._shaderSets[8].uniformMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[8].shaderProgram,
      'u_matrix'
    );
    this._shaderSets[8].uniformClipMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[8].shaderProgram,
      'u_clipMatrix'
    );
    this._shaderSets[8].uniformChannelFlagLocation = this.gl.getUniformLocation(
      this._shaderSets[8].shaderProgram,
      'u_channelFlag'
    );
    this._shaderSets[8].uniformBaseColorLocation = this.gl.getUniformLocation(
      this._shaderSets[8].shaderProgram,
      'u_baseColor'
    );

    // 乗算（クリッピング・反転、PremultipliedAlpha）
    this._shaderSets[9].attributePositionLocation = this.gl.getAttribLocation(
      this._shaderSets[9].shaderProgram,
      'a_position'
    );
    this._shaderSets[9].attributeTexCoordLocation = this.gl.getAttribLocation(
      this._shaderSets[9].shaderProgram,
      'a_texCoord'
    );
    this._shaderSets[9].samplerTexture0Location = this.gl.getUniformLocation(
      this._shaderSets[9].shaderProgram,
      's_texture0'
    );
    this._shaderSets[9].samplerTexture1Location = this.gl.getUniformLocation(
      this._shaderSets[9].shaderProgram,
      's_texture1'
    );
    this._shaderSets[9].uniformMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[9].shaderProgram,
      'u_matrix'
    );
    this._shaderSets[9].uniformClipMatrixLocation = this.gl.getUniformLocation(
      this._shaderSets[9].shaderProgram,
      'u_clipMatrix'
    );
    this._shaderSets[9].uniformChannelFlagLocation = this.gl.getUniformLocation(
      this._shaderSets[9].shaderProgram,
      'u_channelFlag'
    );
    this._shaderSets[9].uniformBaseColorLocation = this.gl.getUniformLocation(
      this._shaderSets[9].shaderProgram,
      'u_baseColor'
    );
  }

  /**
   * シェーダプログラムをロードしてアドレスを返す
   * @param vertexShaderSource    頂点シェーダのソース
   * @param fragmentShaderSource  フラグメントシェーダのソース
   * @return シェーダプログラムのアドレス
   */
  public loadShaderProgram(
    vertexShaderSource: string,
    fragmentShaderSource: string
  ): WebGLProgram {
    // Create Shader Program
    let shaderProgram: WebGLProgram = this.gl.createProgram();

    let vertShader = this.compileShaderSource(
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );

    if (!vertShader) {
      // CubismLogError('Vertex shader compile error!');
      return 0;
    }

    let fragShader = this.compileShaderSource(
      this.gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    if (!fragShader) {
      // CubismLogError('Vertex shader compile error!');
      return 0;
    }

    // Attach vertex shader to program
    this.gl.attachShader(shaderProgram, vertShader);

    // Attach fragment shader to program
    this.gl.attachShader(shaderProgram, fragShader);

    // link program
    this.gl.linkProgram(shaderProgram);
    const linkStatus = this.gl.getProgramParameter(
      shaderProgram,
      this.gl.LINK_STATUS
    );

    // リンクに失敗したらシェーダーを削除
    if (!linkStatus) {
      // CubismLogError('Failed to link program: {0}', shaderProgram);

      this.gl.deleteShader(vertShader);
      vertShader = 0;

      this.gl.deleteShader(fragShader);
      fragShader = 0;

      if (shaderProgram) {
        this.gl.deleteProgram(shaderProgram);
        shaderProgram = 0;
      }

      return 0;
    }

    // Release vertex and fragment shaders.
    this.gl.deleteShader(vertShader);
    this.gl.deleteShader(fragShader);

    return shaderProgram;
  }

  /**
   * シェーダープログラムをコンパイルする
   * @param shaderType シェーダタイプ(Vertex/Fragment)
   * @param shaderSource シェーダソースコード
   *
   * @return コンパイルされたシェーダープログラム
   */
  public compileShaderSource(
    shaderType: GLenum,
    shaderSource: string
  ): WebGLProgram {
    const source: string = shaderSource;

    const shader: WebGLProgram = this.gl.createShader(shaderType);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!shader) {
      const log: string = this.gl.getShaderInfoLog(shader);
      // CubismLogError('Shader compile log: {0} ', log);
    }

    const status: any = this.gl.getShaderParameter(
      shader,
      this.gl.COMPILE_STATUS
    );
    if (!status) {
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  public setGl(gl: WebGLRenderingContext): void {
    this.gl = gl;
  }
}


/**
 * CubismShaderWebGLのインナークラス
 */
export class CubismShaderSet {
  shaderProgram: WebGLProgram; // シェーダープログラムのアドレス
  attributePositionLocation: GLuint; // シェーダープログラムに渡す変数のアドレス（Position）
  attributeTexCoordLocation: GLuint; // シェーダープログラムに渡す変数のアドレス（TexCoord）
  uniformMatrixLocation: WebGLUniformLocation; // シェーダープログラムに渡す変数のアドレス（Matrix）
  uniformClipMatrixLocation: WebGLUniformLocation; // シェーダープログラムに渡す変数のアドレス（ClipMatrix）
  samplerTexture0Location: WebGLUniformLocation; // シェーダープログラムに渡す変数のアドレス（Texture0）
  samplerTexture1Location: WebGLUniformLocation; // シェーダープログラムに渡す変数のアドレス（Texture1）
  uniformBaseColorLocation: WebGLUniformLocation; // シェーダープログラムに渡す変数のアドレス（BaseColor）
  uniformChannelFlagLocation: WebGLUniformLocation; // シェーダープログラムに渡す変数のアドレス（ChannelFlag）
}


export const vertexShaderSrcSetupMask =
  'attribute vec4     a_position;' +
  'attribute vec2     a_texCoord;' +
  'varying vec2       v_texCoord;' +
  'varying vec4       v_myPos;' +
  'uniform mat4       u_clipMatrix;' +
  'void main()' +
  '{' +
  '   gl_Position = u_clipMatrix * a_position;' +
  '   v_myPos = u_clipMatrix * a_position;' +
  '   v_texCoord = a_texCoord;' +
  '   v_texCoord.y = 1.0 - v_texCoord.y;' +
  '}';
export const fragmentShaderSrcsetupMask =
  'precision mediump float;' +
  'varying vec2       v_texCoord;' +
  'varying vec4       v_myPos;' +
  'uniform vec4       u_baseColor;' +
  'uniform vec4       u_channelFlag;' +
  'uniform sampler2D  s_texture0;' +
  'void main()' +
  '{' +
  '   float isInside = ' +
  '       step(u_baseColor.x, v_myPos.x/v_myPos.w)' +
  '       * step(u_baseColor.y, v_myPos.y/v_myPos.w)' +
  '       * step(v_myPos.x/v_myPos.w, u_baseColor.z)' +
  '       * step(v_myPos.y/v_myPos.w, u_baseColor.w);' +
  '   gl_FragColor = u_channelFlag * texture2D(s_texture0, v_texCoord).a * isInside;' +
  '}';

// ----- バーテックスシェーダプログラム -----
// Normal & Add & Mult 共通
export const vertexShaderSrc =
  'attribute vec4     a_position;' + // v.vertex
  'attribute vec2     a_texCoord;' + // v.texcoord
  'varying vec2       v_texCoord;' + // v2f.texcoord
  'uniform mat4       u_matrix;' +
  'void main()' +
  '{' +
  '   gl_Position = u_matrix * a_position;' +
  '   v_texCoord = a_texCoord;' +
  '   v_texCoord.y = 1.0 - v_texCoord.y;' +
  '}';

// Normal & Add & Mult 共通（クリッピングされたものの描画用）
export const vertexShaderSrcMasked =
  'attribute vec4     a_position;' +
  'attribute vec2     a_texCoord;' +
  'varying vec2       v_texCoord;' +
  'varying vec4       v_clipPos;' +
  'uniform mat4       u_matrix;' +
  'uniform mat4       u_clipMatrix;' +
  'void main()' +
  '{' +
  '   gl_Position = u_matrix * a_position;' +
  '   v_clipPos = u_clipMatrix * a_position;' +
  '   v_texCoord = a_texCoord;' +
  '   v_texCoord.y = 1.0 - v_texCoord.y;' +
  '}';

// ----- フラグメントシェーダプログラム -----
// Normal & Add & Mult 共通 （PremultipliedAlpha）
export const fragmentShaderSrcPremultipliedAlpha =
  'precision mediump float;' +
  'varying vec2       v_texCoord;' + // v2f.texcoord
  'uniform vec4       u_baseColor;' +
  'uniform sampler2D  s_texture0;' + // _MainTex
  'void main()' +
  '{' +
  '   gl_FragColor = texture2D(s_texture0 , v_texCoord) * u_baseColor;' +
  '}';

// Normal （クリッピングされたものの描画用、PremultipliedAlpha兼用）
export const fragmentShaderSrcMaskPremultipliedAlpha =
  'precision mediump float;' +
  'varying vec2       v_texCoord;' +
  'varying vec4       v_clipPos;' +
  'uniform vec4       u_baseColor;' +
  'uniform vec4       u_channelFlag;' +
  'uniform sampler2D  s_texture0;' +
  'uniform sampler2D  s_texture1;' +
  'void main()' +
  '{' +
  '   vec4 col_formask = texture2D(s_texture0 , v_texCoord) * u_baseColor;' +
  '   vec4 clipMask = (1.0 - texture2D(s_texture1, v_clipPos.xy / v_clipPos.w)) * u_channelFlag;' +
  '   float maskVal = clipMask.r + clipMask.g + clipMask.b + clipMask.a;' +
  '   col_formask = col_formask * maskVal;' +
  '   gl_FragColor = col_formask;' +
  '}';

// Normal & Add & Mult 共通（クリッピングされて反転使用の描画用、PremultipliedAlphaの場合）
export const fragmentShaderSrcMaskInvertedPremultipliedAlpha =
  'precision mediump float;' +
  'varying vec2 v_texCoord;' +
  'varying vec4 v_clipPos;' +
  'uniform sampler2D s_texture0;' +
  'uniform sampler2D s_texture1;' +
  'uniform vec4 u_channelFlag;' +
  'uniform vec4 u_baseColor;' +
  'void main()' +
  '{' +
  'vec4 col_formask = texture2D(s_texture0, v_texCoord) * u_baseColor;' +
  'vec4 clipMask = (1.0 - texture2D(s_texture1, v_clipPos.xy / v_clipPos.w)) * u_channelFlag;' +
  'float maskVal = clipMask.r + clipMask.g + clipMask.b + clipMask.a;' +
  'col_formask = col_formask * (1.0 - maskVal);' +
  'gl_FragColor = col_formask;' +
  '}';

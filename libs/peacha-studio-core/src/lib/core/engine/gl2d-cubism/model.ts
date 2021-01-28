import { Utils, NativeModel } from './live2dcubismcore';
import { Component } from '../ecs';
import { CubismBlendMode } from './render/blend-mode';

export class CubismModel {
  constructor(public native: NativeModel) {
    this.parameterValues = native.parameters.values;
    this.partOpacities = native.parts.opacities;
    this.parameterMaximumValues = native.parameters.maximumValues;
    this.parameterMinimumValues = native.parameters.minimumValues;
    this.parameterDefaultValues = native.parameters.defaultValues;
    this.parameterLockMap = new Map();
    this.partLockMap = new Map();
    // load live2dmodel component
    const pids = native.parameters.ids;
    const pcount = native.parameters.count;
    const parameterIdMap = new Map();
    for (let i = 0; i < pcount; i++) {
      parameterIdMap.set(pids[i], i);
    }
    this.parameterIdMap = parameterIdMap;

    this.PARAM_ANGLE_X = this._testParameter('ParamAngleX', 'PARAM_ANGLE_X');
    this.PARAM_ANGLE_Y = this._testParameter('ParamAngleY', 'PARAM_ANGLE_Y');
    this.PARAM_ANGLE_Z = this._testParameter('ParamAngleZ', 'PARAM_ANGLE_Z');
    this.PARAM_BODY_ANGLE_X = this._testParameter('ParamBodyAngleX', 'PARAM_BODY_ANGLE_X');
    this.PARAM_BODY_ANGLE_Y = this._testParameter('ParamBodyAngleY', 'PARAM_BODY_ANGLE_Y');
    this.PARAM_BODY_ANGLE_Z = this._testParameter('ParamBodyAngleZ', 'PARAM_BODY_ANGLE_Z');
    this.PARAM_BREATH = this._testParameter('ParamBreath', 'PARAM_BREATH');
    this.PARAM_EYE_BALL_X = this._testParameter('ParamEyeBallX', 'PARAM_EYE_BALL_X');
    this.PARAM_EYE_BALL_Y = this._testParameter('ParamEyeBallY', 'PARAM_EYE_BALL_Y');
    this.PARAM_EYE_BALL_FORM = this._testParameter('ParamEyeBallForm', 'PARAM_EYE_BALL_FORM');
    this.PARAM_EYE_LEFT_OPEN = this._testParameter('ParamEyeLOpen', 'PARAM_EYE_L_OPEN');
    this.PARAM_EYE_LEFT_SMILE = this._testParameter('ParamEyeLSmile', 'PARAM_EYE_L_SMILE');
    this.PARAM_EYE_RIGHT_OPEN = this._testParameter('ParamEyeROpen', 'PARAM_EYE_R_OPEN');
    this.PARAM_EYE_RIGHT_SMILE = this._testParameter('ParamEyeRSmile', 'PARAM_EYE_R_SMILE');
    this.PARAM_BROW_RIGHT_X = this._testParameter('ParamBrowRX', 'PARAM_BROW_R_X');
    this.PARAM_BROW_RIGHT_Y = this._testParameter('ParamBrowRY', 'PARAM_BROW_R_Y');
    this.PARAM_BROW_LEFT_Y = this._testParameter('ParamBrowLY', 'PARAM_BROW_L_Y');
    this.PARAM_BROW_LEFT_X = this._testParameter('ParamBrowLX', 'PARAM_BROW_L_X');
    this.PARAM_CHEEK = this._testParameter('ParamCheek', 'PARAM_CHEEK');
    this.PARAM_BROW_LEFT_ANGLE = this._testParameter('ParamBrowLAngle', 'PARAM_BROW_L_ANGLE');
    this.PARAM_BROW_RIGHT_ANGLE = this._testParameter('ParamBrowRAngle', 'PARAM_BROW_R_ANGLE');
    this.PARAM_BROW_LEFT_FORM = this._testParameter('ParamBrowLForm', 'PARAM_BROW_L_FORM');
    this.PARAM_BROW_RIGHT_FORM = this._testParameter('ParamBrowRForm', 'PARAM_BROW_R_FORM');
    this.PARAM_MOUTH_FORM = this._testParameter('ParamMouthForm', 'PARAM_MOUTH_FORM');
    this.PARAM_MOUTH_OPEN_Y = this._testParameter('ParamMouthOpenY', 'PARAM_MOUTH_OPEN_Y');

    const paids = native.parts.ids;
    const pacount = native.parts.count;
    const partIdMap = new Map();
    for (let i = 0; i < pacount; i++) {
      partIdMap.set(paids[i], i);
    }
    this.partIdMap = partIdMap;

    const dids = native.drawables.ids;
    const dcount = native.drawables.count;
    const drawableIdMap = new Map();
    for (let i = 0; i < dcount; i++) {
      drawableIdMap.set(dids[i], i);
    }
    this.drawableIdMap = drawableIdMap;
  }

  parameterValues: Float32Array;
  partOpacities: Float32Array;
  parameterMaximumValues: Float32Array;
  parameterMinimumValues: Float32Array;
  parameterDefaultValues: Float32Array;
  parameterIdMap: Map<string, number>;
  partIdMap: Map<string, number>;
  drawableIdMap: Map<string, number>;
  parameterLockMap: Map<number, boolean>;
  partLockMap: Map<number, boolean>;

  readonly PARAM_ANGLE_X: number;
  readonly PARAM_ANGLE_Y: number;
  readonly PARAM_ANGLE_Z: number;
  readonly PARAM_BODY_ANGLE_X: number;
  readonly PARAM_BODY_ANGLE_Y: number;
  readonly PARAM_BODY_ANGLE_Z: number;
  readonly PARAM_EYE_LEFT_OPEN: number;
  readonly PARAM_EYE_RIGHT_OPEN: number;
  readonly PARAM_EYE_LEFT_SMILE: number;
  readonly PARAM_EYE_RIGHT_SMILE: number;
  readonly PARAM_BROW_LEFT_Y: number;
  readonly PARAM_BROW_RIGHT_Y: number;
  readonly PARAM_BROW_LEFT_X: number;
  readonly PARAM_BROW_RIGHT_X: number;
  readonly PARAM_BROW_LEFT_ANGLE: number;
  readonly PARAM_BROW_RIGHT_ANGLE: number;
  readonly PARAM_BROW_LEFT_FORM: number;
  readonly PARAM_BROW_RIGHT_FORM: number;
  readonly PARAM_EYE_BALL_FORM: number;
  readonly PARAM_EYE_BALL_X: number;
  readonly PARAM_EYE_BALL_Y: number;
  readonly PARAM_MOUTH_FORM: number;
  readonly PARAM_MOUTH_OPEN_Y: number;
  readonly PARAM_CHEEK: number;
  readonly PARAM_BREATH: number;

  setParameterLockByIndex(index: number, lock: boolean): void {
    this.parameterLockMap.set(index, lock);
  }
  getParameterLockByIndex(index: number): boolean {
    return this.parameterLockMap.get(index);
  }
  setPartLockByIndex(index: number, lock: boolean): void {
    this.partLockMap.set(index, lock);
  }
  getPartLockByIndex(index: number): boolean {
    return this.partLockMap.get(index);
  }
  getParameterDefaultValueById(id: string): number {
    return this.parameterMaximumValues[this.parameterIdMap.get(id)];
  }

  getParameterDefaultValueByIndex(index: number): number {
    return this.parameterDefaultValues[index];
  }

  getParameterMaximumValueById(id: string): number {
    return this.parameterMaximumValues[this.parameterIdMap.get(id)];
  }

  getParameterMinimumValueByIndex(index: number): number {
    return this.parameterMinimumValues[index];
  }

  getParameterMinimumValueById(id: string): number {
    return this.parameterMaximumValues[this.parameterIdMap.get(id)];
  }

  getParameterMaximumValueByIndex(index: number): number {
    return this.parameterMaximumValues[index];
  }

  getPartIndex(id: string): number {
    return this.partIdMap.get(id);
  }

  getParameterIndex(id: string): number {
    return this.parameterIdMap.get(id);
  }

  getCanvasHeight(): number {
    return this.native.canvasinfo.CanvasHeight / this.native.canvasinfo.PixelsPerUnit;
  }

  getCanvasWidth(): number {
    return this.native.canvasinfo.CanvasWidth / this.native.canvasinfo.PixelsPerUnit;
  }

  getParameterById(id: string): number {
    return this.parameterValues[this.parameterIdMap.get(id)];
  }

  setParameterById(id: string, value: number, weight: number = 1.0): void {
    if (!this.parameterLockMap.get(this.parameterIdMap.get(id))) {
      this.parameterValues[this.parameterIdMap.get(id)] = value * weight;
    }
  }

  getParameterByIndex(index: number): number {
    return this.parameterValues[index];
  }

  addParameterById(id: string, value: number, weight: number): void {
    if (!this.parameterLockMap.get(this.parameterIdMap.get(id))) {
      this.parameterValues[this.parameterIdMap.get(id)] += (value * weight);
    }
  }

  addParameterByIndex(index: number, value: number, weight: number): void {
    if (!this.parameterLockMap.get(index)) {
      this.parameterValues[index] += (value * weight);
    }
  }

  multiplyParameterById(id: string, value: number, weight: number): void {
    if (!this.parameterLockMap.get(this.parameterIdMap.get(id))) {
      this.parameterValues[this.parameterIdMap.get(id)] *= (1.0 + (value - 1.0) * weight);
    }
  }

  multiplyParameterByIndex(index: number, value: number, weight: number): void {
    if (!this.parameterLockMap.get(index)) {
      this.parameterValues[index] *= (1.0 + (value - 1.0) * weight);
    }
  }

  setParameterByIndex(index: number, value: number, weight: number = 1.0): void {
    if (!this.parameterLockMap.get(index)) {
      this.parameterValues[index] = value;
    }
  }

  getPartOpacityById(id: string): number {
    return this.partOpacities[this.partIdMap.get(id)];
  }

  getPartOpacityByIndex(index: number): number {
    return this.partOpacities[index];
  }

  setPartOpacityById(id: string, value: number): void {
    if (!this.partLockMap.get(this.partIdMap.get(id))) {
      this.partOpacities[this.partIdMap.get(id)] = value;
    }
  }

  setPartOpacityByIndex(index: number, value: number): void {
    if (!this.partLockMap.get(index)) {
      this.partOpacities[index] = value;
    }
  }

  getDrawableCount(): number {
    const drawableCount = this.native.drawables.count;
    return drawableCount;
  }

  getDrawableId(drawableIndex: number): string {
    const parameterIds: string[] = this.native.drawables.ids;
    return parameterIds[drawableIndex];
  }

  getDrawableRenderOrders(): Int32Array {
    const renderOrders: Int32Array = this.native.drawables.renderOrders;
    return renderOrders;
  }

  getDrawableTextureIndices(drawableIndex: number): number {
    const textureIndices: Int32Array = this.native.drawables.textureIndices;
    return textureIndices[drawableIndex];
  }

  /**
   * DrawableのVertexPositionsの変化情報の取得
   *
   * 直近のCubismModel.update関数でDrawableの頂点情報が変化したかを取得する。
   *
   * @param   drawableIndex   Drawableのインデックス
   * @retval  true    Drawableの頂点情報が直近のCubismModel.update関数で変化した
   * @retval  false   Drawableの頂点情報が直近のCubismModel.update関数で変化していない
   */
  getDrawableDynamicFlagVertexPositionsDidChange(drawableIndex: number): boolean {
    const dynamicFlags: Uint8Array = this.native.drawables.dynamicFlags;
    return Utils.hasVertexPositionsDidChangeBit(dynamicFlags[drawableIndex]);
  }

  /**
   * Drawableの頂点インデックスの個数の取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableの頂点インデックスの個数
   */
  getDrawableVertexIndexCount(drawableIndex: number): number {
    const indexCounts: Int32Array = this.native.drawables.indexCounts;
    return indexCounts[drawableIndex];
  }

  /**
   * Drawableの頂点の個数の取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableの頂点の個数
   */
  getDrawableVertexCount(drawableIndex: number): number {
    const vertexCounts = this.native.drawables.vertexCounts;
    return vertexCounts[drawableIndex];
  }

  /**
   * Drawableの頂点リストの取得
   * @param drawableIndex drawableのインデックス
   * @return drawableの頂点リスト
   */
  getDrawableVertices(drawableIndex: number): Float32Array {
    return this.getDrawableVertexPositions(drawableIndex);
  }

  /**
   * Drawableの頂点インデックスリストの取得
   * @param drarableIndex Drawableのインデックス
   * @return drawableの頂点インデックスリスト
   */
  getDrawableVertexIndices(drawableIndex: number): Uint16Array {
    const indicesArray: Uint16Array[] = this.native.drawables.indices;
    return indicesArray[drawableIndex];
  }

  /**
   * Drawableの頂点リストの取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableの頂点リスト
   */
  getDrawableVertexPositions(drawableIndex: number): Float32Array {
    const verticesArray: Float32Array[] = this.native.drawables.vertexPositions;
    return verticesArray[drawableIndex];
  }

  /**
   * Drawableの頂点のUVリストの取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableの頂点UVリスト
   */
  getDrawableVertexUvs(drawableIndex: number): Float32Array {
    const uvsArray: Float32Array[] = this.native.drawables.vertexUvs;
    return uvsArray[drawableIndex];
  }

  /**
   * Drawableの不透明度の取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableの不透明度
   */
  getDrawableOpacity(drawableIndex: number): number {
    const opacities: Float32Array = this.native.drawables.opacities;
    return opacities[drawableIndex];
  }

  /**
   * Drawableのカリング情報の取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableのカリング情報
   */
  getDrawableCulling(drawableIndex: number): boolean {
    const constantFlags = this.native.drawables.constantFlags;

    return !Utils.hasIsDoubleSidedBit(constantFlags[drawableIndex]);
  }

  /**
   * Drawableのブレンドモードを取得
   * @param drawableIndex Drawableのインデックス
   * @return drawableのブレンドモード
   */
  getDrawableBlendMode(drawableIndex: number): CubismBlendMode {
    const constantFlags = this.native.drawables.constantFlags;

    return (Utils.hasBlendAdditiveBit(constantFlags[drawableIndex]))
      ? CubismBlendMode.CubismBlendMode_Additive
      : (Utils.hasBlendMultiplicativeBit(constantFlags[drawableIndex]))
        ? CubismBlendMode.CubismBlendMode_Multiplicative
        : CubismBlendMode.CubismBlendMode_Normal;
  }

  /**
   * Drawableのマスクの反転使用の取得
   *
   * Drawableのマスク使用時の反転設定を取得する。
   * マスクを使用しない場合は無視される。
   *
   * @param drawableIndex Drawableのインデックス
   * @return Drawableの反転設定
   */
  getDrawableInvertedMaskBit(drawableIndex: number): boolean {
    const constantFlags: Uint8Array = this.native.drawables.constantFlags;

    return (Utils.hasIsInvertedMaskBit(constantFlags[drawableIndex]));
  }

  /**
   * Drawableのクリッピングマスクリストの取得
   * @return Drawableのクリッピングマスクリスト
   */
  getDrawableMasks(): Int32Array[] {
    const masks: Int32Array[] = this.native.drawables.masks;
    return masks;
  }

  /**
   * Drawableのクリッピングマスクの個数リストの取得
   * @return Drawableのクリッピングマスクの個数リスト
   */
  getDrawableMaskCounts(): Int32Array {
    const maskCounts: Int32Array = this.native.drawables.maskCounts;
    return maskCounts;
  }

  /**
   * クリッピングマスクの使用状態
   *
   * @return true クリッピングマスクを使用している
   * @return false クリッピングマスクを使用していない
   */
  isUsingMasking(): boolean {
    for (let d = 0; d < this.native.drawables.count; ++d) {
      if (this.native.drawables.maskCounts[d] <= 0) {
        continue;
      }
      return true;
    }
    return false;
  }

  /**
   * Drawableの表示情報を取得する
   *
   * @param drawableIndex Drawableのインデックス
   * @return true Drawableが表示
   * @return false Drawableが非表示
   */
  getDrawableDynamicFlagIsVisible(drawableIndex: number): boolean {
    const dynamicFlags: Uint8Array = this.native.drawables.dynamicFlags;
    return Utils.hasIsVisibleBit(dynamicFlags[drawableIndex]);
  }

  /**
   * DrawableのDrawOrderの変化情報の取得
   *
   * 直近のCubismModel.update関数でdrawableのdrawOrderが変化したかを取得する。
   * drawOrderはartMesh上で指定する0から1000の情報
   * @param drawableIndex drawableのインデックス
   * @return true drawableの不透明度が直近のCubismModel.update関数で変化した
   * @return false drawableの不透明度が直近のCubismModel.update関数で変化している
   */
  getDrawableDynamicFlagVisibilityDidChange(drawableIndex: number): boolean {
    const dynamicFlags: Uint8Array = this.native.drawables.dynamicFlags;
    return Utils.hasVisibilityDidChangeBit(dynamicFlags[drawableIndex]);
  }

  /**
   * Drawableの不透明度の変化情報の取得
   *
   * 直近のCubismModel.update関数でdrawableの不透明度が変化したかを取得する。
   *
   * @param drawableIndex drawableのインデックス
   * @return true Drawableの不透明度が直近のCubismModel.update関数で変化した
   * @return false Drawableの不透明度が直近のCubismModel.update関数で変化してない
   */
  getDrawableDynamicFlagOpacityDidChange(drawableIndex: number): boolean {
    const dynamicFlags: Uint8Array = this.native.drawables.dynamicFlags;
    return Utils.hasOpacityDidChangeBit(dynamicFlags[drawableIndex]);
  }

  /**
   * Drawableの描画順序の変化情報の取得
   *
   * 直近のCubismModel.update関数でDrawableの描画の順序が変化したかを取得する。
   *
   * @param drawableIndex Drawableのインデックス
   * @return true Drawableの描画の順序が直近のCubismModel.update関数で変化した
   * @return false Drawableの描画の順序が直近のCubismModel.update関数で変化してない
   */
  getDrawableDynamicFlagRenderOrderDidChange(drawableIndex: number): boolean {
    const dynamicFlags: Uint8Array = this.native.drawables.dynamicFlags;
    return Utils.hasRenderOrderDidChangeBit(dynamicFlags[drawableIndex]);
  }

  getDrawableIndex(id: string): number {
    return this.drawableIdMap.get(id);
  }
  // readonly PARAM_ARM_LEFT_A;
  // readonly PARAM_ARM_RIGHT_A;
  // readonly PARAM_ARM_LEFT_B;
  // readonly PARAM_ARM_RIGHT_B;
  // readonly PARAM_BUST_X;
  // readonly PARAM_BUST_Y;
  // readonly PARAM_BASE_Y;
  // readonly PARAM_NONE;
  // readonly PARAM_SHOUDLER_Y;
  // readonly PARAM_HAIR_FRONT;
  // readonly PARAM_HAIR_SIDE;
  // readonly PARAM_HAIR_FLUFFY;
  // readonly PARAM_HAIR_BACK;
  // readonly PARAM_HAND_LEFT;
  // readonly PARAM_HAND_RIGHT;

  private _testParameter(...paramIds: string[]): number {
    for (const id of paramIds) {
      if (this.parameterIdMap.has(id)) {
        return this.parameterIdMap.get(id);
      }
    }
    return -1;
  }
}

export const CubismModelComponent = Component.register<CubismModel>();

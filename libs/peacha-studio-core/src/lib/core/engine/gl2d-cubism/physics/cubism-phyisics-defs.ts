import { Vector2, vec2 } from '../../gl2d';
/**
 * 物理演算の適用先の種類
 */
export enum CubismPhysicsTargetType {
    CubismPhysicsTargetType_Parameter,  // パラメータに対して適用
}

/**
 * 物理演算の入力の種類
 */
export enum CubismPhysicsSource {
    CubismPhysicsSource_X,          // X軸の位置から
    CubismPhysicsSource_Y,          // Y軸の位置から
    CubismPhysicsSource_Angle,      // 角度から
}

/**
 * @brief 物理演算で使用する外部の力
 *
 * 物理演算で使用する外部の力。
 */
export class PhysicsJsonEffectiveForces {
    constructor() {
        this.gravity = vec2(0, 0);
        this.wind = vec2(0, 0);
    }
    gravity: Vector2;          /// < 重力
    wind: Vector2;          /// < 風
}

/**
 * 物理演算のパラメータ情報
 */
export class CubismPhysicsParameter {
    id: string;   // パラメータ
    targetType: CubismPhysicsTargetType;    // 適用先の種類
}

/**
 * 物理演算の正規化情報
 */
export class CubismPhysicsNormalization {
    constructor() {
        this.minimum = 0;
        this.maximum = 0;
        this.defalut = 0;
    }
    minimum: number;    // 最大値
    maximum: number;    // 最小値
    defalut: number;    // デフォルト値
}

/**
 * 物理演算の演算委使用する物理点の情報
 */
export class CubismPhysicsParticle {
    constructor() {
        this.initialPosition = vec2(0, 0);
        this.position = vec2(0, 0);
        this.lastPosition = vec2(0, 0);
        this.lastGravity = vec2(0, 0);
        this.force = vec2(0, 0);
        this.velocity = vec2(0, 0);
    }

    initialPosition: Vector2; // 初期位置
    mobility: number;               // 動きやすさ
    delay: number;                  // 遅れ
    acceleration: number;           // 加速度
    radius: number;                 // 距離
    position: Vector2;        // 現在の位置
    lastPosition: Vector2;    // 最後の位置
    lastGravity: Vector2;     // 最後の重力
    force: Vector2;           // 現在かかっている力
    velocity: Vector2;        // 現在の速度
}

/**
 * 物理演算の物理点の管理
 */
export class CubismPhysicsSubRig {
    constructor() {
        this.normalizationPosition = new CubismPhysicsNormalization();
        this.normalizationAngle = new CubismPhysicsNormalization();
    }
    inputCount: number;                                 // 入力の個数
    outputCount: number;                                // 出力の個数
    particleCount: number;                              // 物理点の個数
    baseInputIndex: number;                             // 入力の最初のインデックス
    baseOutputIndex: number;                            // 出力の最初のインデックス
    baseParticleIndex: number;                          // 物理点の最初のインデックス
    normalizationPosition: CubismPhysicsNormalization;  // 正規化された位置
    normalizationAngle: CubismPhysicsNormalization;     // 正規化された角度
}

/**
 * 正規化されたパラメータの取得関数の宣言
 * @param targetTranslation     // 演算結果の移動値
 * @param targetAngle           // 演算結果の角度
 * @param value                 // パラメータの値
 * @param parameterMinimunValue // パラメータの最小値
 * @param parameterMaximumValue // パラメータの最大値
 * @param parameterDefaultValue // パラメータのデフォルト値
 * @param normalizationPosition // 正規化された位置
 * @param normalizationAngle    // 正規化された角度
 * @param isInverted            // 値が反転されているか？
 * @param weight                // 重み
 */
export type normalizedPhysicsParameterValueGetter = (
        targetTranslation: Vector2,
        targetAngle: { angle: number },
        value: number,
        parameterMinimunValue: number,
        parameterMaximumValue: number,
        parameterDefaultValue: number,
        normalizationPosition: CubismPhysicsNormalization,
        normalizationAngle: CubismPhysicsNormalization,
        isInverted: boolean,
        weight: number
    ) => void;

/**
 * 物理演算の値の取得関数の宣言
 * @param translation 移動値
 * @param particles 物理点のリスト
 * @param isInverted 値が反映されているか
 * @param parentGravity 重力
 * @return 値
 */
export type physicsValueGetter = (
        translation: Vector2,
        particles: CubismPhysicsParticle[],
        particleIndex: number,
        isInverted: boolean,
        parentGravity: Vector2
    ) => number;

/**
 * 物理演算のスケールの取得関数の宣言
 * @param translationScale 移動値のスケール
 * @param angleScale    角度のスケール
 * @return スケール値
 */
export type physicsScaleGetter = (
        translationScale: Vector2,
        angleScale: number
    ) => number;

/**
 * 物理演算の入力情報
 */
export class CubismPhysicsInput {
    constructor() {
        this.source = new CubismPhysicsParameter();
    }
    source: CubismPhysicsParameter;     // 入力元のパラメータ
    sourceParameterIndex: number;       // 入力元のパラメータのインデックス
    weight: number;                     // 重み
    type: number;                       // 入力の種類
    reflect: boolean;                   // 値が反転されているかどうか
    getNormalizedParameterValue: normalizedPhysicsParameterValueGetter;   // 正規化されたパラメータ値の取得関数
}

/**
 * @brief 物理演算の出力情報
 *
 * 物理演算の出力情報。
 */
export class CubismPhysicsOutput {
    constructor() {
        this.destination = new CubismPhysicsParameter();
        this.translationScale = vec2(0, 0);
    }

    destination: CubismPhysicsParameter;        /// < 出力先のパラメータ
    destinationParameterIndex: number;          /// < 出力先のパラメータのインデックス
    vertexIndex: number;                        /// < 振り子のインデックス
    translationScale: Vector2;            /// < 移動値のスケール
    angleScale: number;                         /// < 角度のスケール
    weight: number;                             /// 重み
    type: CubismPhysicsSource;                  /// < 出力の種類
    reflect: boolean;                           /// < 値が反転されているかどうか
    valueBelowMinimum: number;                  /// < 最小値を下回った時の値
    valueExceededMaximum: number;               /// < 最大値をこえた時の値
    getValue: physicsValueGetter;             /// < 物理演算の値の取得関数
    getScale: physicsScaleGetter;             /// < 物理演算のスケール値の取得関数
}

/**
 * @brief 物理演算のデータ
 *
 * 物理演算のデータ。
 */
export class CubismPhysicsRig {
    constructor() {
        this.settings = new Array<CubismPhysicsSubRig>();
        this.inputs = new Array<CubismPhysicsInput>();
        this.outputs = new Array<CubismPhysicsOutput>();
        this.particles = new Array<CubismPhysicsParticle>();
        this.gravity = vec2(0, 0);
        this.wind = vec2(0, 0);
    }

    subRigCount: number;                    /// < 物理演算の物理点の個数
    settings: Array<CubismPhysicsSubRig>;        /// < 物理演算の物理点の管理のリスト
    inputs: Array<CubismPhysicsInput>;           /// < 物理演算の入力のリスト
    outputs: Array<CubismPhysicsOutput>;         /// < 物理演算の出力のリスト
    particles: Array<CubismPhysicsParticle>;     /// < 物理演算の物理点のリスト
    gravity: Vector2;                 /// < 重力
    wind: Vector2;                    /// < 風
}

import { SystemBase, Entity } from '../../ecs';
import { CubismModelComponent, CubismModel } from '../model';
import { Cubism3Pose, PartData, Cubism3PoseComponent } from './cubism-pose-component';

const Epsilon = 0.001;

export class CubismPoseSystem extends SystemBase {
    constructor() {
        super([CubismModelComponent,
            Cubism3PoseComponent]);
    }

    update(entity: Entity, delta: number, time: number): void {
        const pose = Cubism3PoseComponent.oneFrom(entity).data;
        const model = CubismModelComponent.oneFrom(entity).data;

        let beginIndex = 0;
        // model.native.update();

        for (let i = 0; i < pose.partGroupCounts.length; i++) {
            const partGroupCount: number = pose.partGroupCounts[i];

            // TODO: time scale
            doFade(model, pose, delta, beginIndex, partGroupCount);
            beginIndex += partGroupCount;
        }
        copyPartOpacities(model, pose);
    }
}

function copyPartOpacities(model: CubismModel, pose: Cubism3Pose): void {
    for (let groupIndex = 0; groupIndex < pose.partGroups.length; ++groupIndex) {
        const partData: PartData = pose.partGroups[groupIndex];

        if (partData.link.length == 0) {
            continue;   // 連動するパラメータはない
        }

        const partIndex: number = pose.partGroups[groupIndex].partIndex;
        const opacity: number = model.getPartOpacityByIndex(partIndex);

        for (let linkIndex = 0; linkIndex < partData.link.length; ++linkIndex) {
            const linkPart: PartData = partData.link[linkIndex];
            const linkPartIndex: number = linkPart.partIndex;
            if (linkPartIndex < 0) {
                continue;
            }
            model.setPartOpacityByIndex(linkPartIndex, opacity);
        }
    }
}

/**
 * パーツのフェード操作を行う。
 * @param model 対象のモデル
 * @param deltaTimeSeconds デルタ時間[秒]
 * @param beginIndex フェード操作を行うパーツグループの先頭インデックス
 * @param partGroupCount フェード操作を行うパーツグループの個数
 */
function doFade(model: CubismModel, pose: Cubism3Pose, deltaTimeSeconds: number, beginIndex: number, partGroupCount: number): void {
    let visiblePartIndex = -1;
    let newOpacity = 1.0;

    const phi = 0.5;
    const backOpacityThreshold = 0.15;

    // 現在、表示状態になっているパーツを取得
    for (let i: number = beginIndex; i < beginIndex + partGroupCount; ++i) {
        const partIndex: number = pose.partGroups[i].partIndex;
        const paramIndex: number = pose.partGroups[i].parameterIndex;

        if (model.getParameterByIndex(paramIndex) > Epsilon) {
            if (visiblePartIndex >= 0) {
                break;
            }

            visiblePartIndex = i;
            newOpacity = model.getPartOpacityByIndex(partIndex);

            // 新しい不透明度を計算
            newOpacity += (deltaTimeSeconds / pose.fadeTimeSeconds);

            if (newOpacity > 1.0) {
                newOpacity = 1.0;
            }
        }
    }

    if (visiblePartIndex < 0) {
        visiblePartIndex = 0;
        newOpacity = 1.0;
    }

    // 表示パーツ、非表示パーツの不透明度を設定する
    for (let i: number = beginIndex; i < beginIndex + partGroupCount; ++i) {
        const partsIndex: number = pose.partGroups[i].partIndex;

        // 表示パーツの設定
        if (visiblePartIndex == i) {
            model.setPartOpacityByIndex(partsIndex, newOpacity);   // 先に設定
        }
        // 非表示パーツの設定
        else {
            let opacity: number = model.getPartOpacityByIndex(partsIndex);
            let a1: number; // 計算によって求められる不透明度

            if (newOpacity < phi) {
                a1 = newOpacity * (phi - 1) / phi + 1.0;    // (0,1),(phi,phi)を通る直線式
            }
            else {
                a1 = (1 - newOpacity) * phi / (1.0 - phi);  // (1,0),(phi,phi)を通る直線式
            }

            // 背景の見える割合を制限する場合
            const backOpacity: number = (1.0 - a1) * (1.0 - newOpacity);

            if (backOpacity > backOpacityThreshold) {
                a1 = 1.0 - backOpacityThreshold / (1.0 - newOpacity);
            }

            if (opacity > a1) {
                opacity = a1;   // 計算の不透明度よりも大きければ（濃ければ）不透明度を上げる
            }

            model.setPartOpacityByIndex(partsIndex, opacity);
        }
    }
}

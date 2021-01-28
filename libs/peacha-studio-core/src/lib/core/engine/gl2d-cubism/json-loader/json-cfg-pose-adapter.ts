import { readStringToEnd } from '../../../vfs/mem-utils';
import { CubismAnimationClip } from '../animation/animation-clip';
import {
  CubismExpJson,
  loadCubismExpressionFromJson,
} from './json-expression-loader';

export type cfgPoseType = 'set_special_pose_param';

export type CfgPose = {
  name: string;
  paramId: string;
  min: number;
  max: number;
  key: number;
};

export function cfgPoseAdapter(cfg: CfgPose): CubismExpJson {
  return {
    Type: '',
    FadeInTime: 1,
    FadeOutTime: 1,
    Parameters: [
      {
        Id: cfg.paramId,
        Value: cfg.max,
        Blend: 'Add',
      },
    ],
  };
}

export function loadCfgClipsFromFile(file: ArrayBuffer): CubismAnimationClip[] {
  return readStringToEnd(file)
    .split('\n')
    .filter((s) => s.length > 0)
    .filter((cfgStr: string) => cfgStr.includes('set_special_pose_param'))
    .map((cfgStr: string) => {
      const list = cfgStr.split(' ').filter((i) => i);
      return loadCubismExpressionFromJson(
        cfgPoseAdapter({
          name: list[1],
          paramId: list[2].replace(/\'/g, ''),
          min: parseFloat(list[3]),
          max: parseFloat(list[4]),
          key: parseInt(list[5], 10),
        }),
        '按键表情 ' + list[5]
      );
    });
}

export function getCfgIdleAnimationNames(file: ArrayBuffer): string[] {
  return readStringToEnd(file)
    .split('\n')
    .filter((s) => s.length > 0)
    .filter((cfgStr: string) => cfgStr.includes('set_idle_anim'))
    .map((cfgStr: string) => {
      return cfgStr.split("'")[1];
    });
}

import { CubismModel } from '../model';
import { Component } from '../../ecs';

export type Cubism3Pose = {
	partGroups: PartData[]; // = new Array();
	partGroupCounts: number[]; // = new Array();
	fadeTimeSeconds: number; // = 0.5; // CONSTNAT
};

export type PartData = {
	partId: string;
	parameterIndex?: number;
	partIndex?: number;
	link: Array<PartData>;
};

export function createCubismPose(cubismModel: CubismModel, p: any): Component<Cubism3Pose> {
	const poseData = {
		fadeTimeSeconds: (s => {
			let c = s.FadeInTime;
			if (c <= 0.0) {
				c = 0.5; // CONSTANT
			}
			return c;
		})(p),
		partGroups: [],
		partGroupCounts: [],
	};
	const poses = p.Groups;
	for (let poseIndex = 0; poseIndex < poses.length; ++poseIndex) {
		const idListInfo = poses[poseIndex];
		const idCount = idListInfo.length;
		let groupCount = 0;
		for (let groupIndex = 0; groupIndex < idCount; ++groupIndex) {
			const partInfo = idListInfo[groupIndex];
			const partData: PartData = {
				partId: partInfo.Id,
				link: partInfo.Link
					? partInfo.Link.map(s => {
							const linkPart: PartData = {
								partId: s,
								link: [],
							};
							partData.link.push(linkPart);
							return linkPart;
					  })
					: [],
			};
			poseData.partGroups.push(partData);
			++groupCount;
		}
		poseData.partGroupCounts.push(groupCount);
	}
	resetCubismPose(cubismModel, poseData);
	// 给爷整晕了
	return new Cubism3PoseComponent(poseData);
}

function initialize(model: CubismModel, v: PartData): void {
	v.parameterIndex = model.getParameterIndex(v.partId);
	v.partIndex = model.getPartIndex(v.partId);

	model.setParameterByIndex(v.parameterIndex, 1);
}

function resetCubismPose(model: CubismModel, pose: Cubism3Pose): void {
	let beginIndex = 0;

	for (let i = 0; i < pose.partGroupCounts.length; ++i) {
		const groupCount: number = pose.partGroupCounts[i];

		for (let j: number = beginIndex; j < beginIndex + groupCount; ++j) {
			initialize(model, pose.partGroups[j]);

			const partsIndex: number = pose.partGroups[j].partIndex;
			const paramIndex: number = pose.partGroups[j].parameterIndex;

			if (partsIndex < 0) {
				continue;
			}

			model.setPartOpacityByIndex(partsIndex, j == beginIndex ? 1.0 : 0.0);
			model.setParameterByIndex(paramIndex, j == beginIndex ? 1.0 : 0.0);

			for (let k = 0; k < pose.partGroups[j].link.length; ++k) {
				initialize(model, pose.partGroups[j].link[k]);
			}
		}

		beginIndex += groupCount;
	}
}

// function assignment(c: PartData, v: PartData): void {
//   c.partId = v.partId;
//   c.link = v.link.map((x) => clone(x));
// }

// function clone(c: PartData): PartData {
//   return {
//     partId: c.partId,
//     parameterIndex: c.parameterIndex,
//     partIndex: c.partIndex,
//     link: c.link.map((x) => clone(x)),
//   };
// }

export const Cubism3PoseComponent = Component.register<Cubism3Pose>();

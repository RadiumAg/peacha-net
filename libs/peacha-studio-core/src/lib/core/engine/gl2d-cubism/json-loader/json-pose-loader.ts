import { CubismModel } from '../model';
import { CubismPoseJson } from './structures';
import { PartData } from '../pose/cubism-pose-component';

export function loadCubismPoseFromJson(model: CubismModel, def: CubismPoseJson) {
    const poseData = {
        fadeTimeSeconds: ((s) => {
            let c = s.FadeInTime;
            if (!c || c <= 0.0) {
                c = 0.5; //CONSTANT
            } return c;
        })(def),
        partGroups: new Array(),
        partGroupCounts: new Array()
    }
    const poses = def.Groups;
    for (let poseIndex: number = 0; poseIndex < poses.length; ++poseIndex) {
        const idListInfo = poses[poseIndex];
        const idCount = idListInfo.length;
        let groupCount: number = 0;
        for (let groupIndex: number = 0; groupIndex < idCount; ++groupIndex) {
            let partInfo = idListInfo[groupIndex];
            let partData: PartData = {
                partId: partInfo.Id,
                link: partInfo.Link ?
                    partInfo.Link.map(s => {
                        let linkPart: PartData = {
                            partId: s,
                            link: []
                        };
                        partData.link.push(linkPart);
                        return linkPart;
                    })
                    : []
            };
            poseData.partGroups.push(partData);
            ++groupCount;
        }
        poseData.partGroupCounts.push(groupCount);
    }
}
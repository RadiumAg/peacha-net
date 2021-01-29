import { distance } from './geom';

export const detectBlink = (eyeOuterCorner, eyeInnerCorner, eyeOuterUpperLid, eyeInnerUpperLid, eyeOuterLowerLid, eyeInnerLowerLid) => {
	const eyeWidth = distance(eyeOuterCorner, eyeInnerCorner);
	const eyeOuterLidDistance = distance(eyeOuterUpperLid, eyeOuterLowerLid);
	const eyeInnerLidDistance = distance(eyeInnerUpperLid, eyeInnerLowerLid);
	const eyeLidDistance = 2.0 * ((eyeOuterLidDistance + eyeInnerLidDistance) / eyeWidth);
	return eyeLidDistance;
};

export default { detectBlink };

import { loadOpalFileFromBuffer } from './opal-file';

import { loadCubismExpressionFromJson } from '../json-loader/json-expression-loader';
import { CubismAnimator, CubismExpressionComponent, CubismMotionComponent } from '../animation/animator';
import { CubismCdi, CubismCdiComponent } from '../cdi';
import { getCfgIdleAnimationNames, loadCfgClipsFromFile } from '../json-loader/json-cfg-pose-adapter';
import { loadEm, Moc, NativeModel } from '../live2dcubismcore';
import { CubismModel, CubismModelComponent } from '../model';
import { loadCubismMotionClipFromJson } from '../json-loader/json-motion-loader';
import { loadPhysicsComponent } from '../json-loader/json-physics-loader';
import { CubismRenderer } from '../render/renderer';
import { GL2DRenderComponent } from '../../gl2d/gl2d-render';
import { createCubismPose } from '../pose/cubism-pose-component';
import { Transform2D, Transform2DComponent } from '../../gl2d/transform';
import { Matrix44 } from '../../gl2d/math/matrix';
import { loadImageFromArrayBuffer, scaleImage } from '../../../vfs/mem-utils';
import { ReadableVirtualFileSystem } from '../../../vfs';

type CubismLoaderOptions = {
	loadPose?: boolean;
	loadRenderer?: boolean;
	loadPhysics?: boolean;
	loadMotions?: boolean;
	loadExpressions?: boolean;
	loadCdi?: boolean;
	loadUserData?: boolean;
	entry?: string;
};

export function findModelEntryFile(): boolean {
	return true;
}

export async function loadOpalModelFromVFS(
	gl: WebGLRenderingContext,
	vfs: ReadableVirtualFileSystem,
	options?: CubismLoaderOptions
): Promise<any[]> {
	const ret = [];
	// #region Initial
	await loadEm(true);
	const file = await vfs.tryFindAndRead(findModelEntryFile);
	const opal = await loadOpalFileFromBuffer(file);
	const moc = Moc.fromArrayBuffer(opal.fileReferences.moc3);
	const nativeModel = NativeModel.fromMoc(moc);
	const cubismModel = new CubismModel(nativeModel);
	ret.push(new CubismModelComponent(cubismModel));
	// #endregion

	// #region Textures

	const textureMap = new Map<number, WebGLTexture>();
	const usePremultiply = true;
	for (let i = 0; i < opal.fileReferences.textures.length; i++) {
		const buffer = opal.fileReferences.textures[i];
		// load texture
		let imgDom: TexImageSource = await loadImageFromArrayBuffer(buffer);
		const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		if (imgDom.width > maxTextureSize || imgDom.height > maxTextureSize) {
			imgDom = await scaleImage(imgDom, maxTextureSize / (imgDom.width > imgDom.height ? imgDom.width : imgDom.height));
		}
		const tex = gl.createTexture();
		// テクスチャを選択
		gl.bindTexture(gl.TEXTURE_2D, tex);
		// テクスチャにピクセルを書き込む
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		// Premult処理を行わせる
		if (usePremultiply) {
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
		}
		// テクスチャにピクセルを書き込む
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgDom);
		// ミップマップを生成
		gl.generateMipmap(gl.TEXTURE_2D);
		// テクスチャをバインド
		gl.bindTexture(gl.TEXTURE_2D, null);
		textureMap.set(i, tex);
	}
	// #endregion

	// #region Renderer
	if (options?.loadRenderer) {
		const live2drenderer = new CubismRenderer(cubismModel, gl, textureMap);
		live2drenderer.setIsPremultipliedAlpha(usePremultiply);
		ret.push(new GL2DRenderComponent(live2drenderer));
	}
	// #endregion

	// #region Motions
	if (opal.fileReferences.motions !== undefined && options?.loadMotions) {
		const animator = new CubismAnimator();

		const idleNames = new Set<string>();
		opal.fileReferences.cfgs?.forEach(f => {
			getCfgIdleAnimationNames(f).forEach(s => {
				idleNames.add(s);
			});
		});

		let index = 0;
		for (const str in opal.fileReferences.model3.FileReferences.Motions) {
			if (str !== undefined) {
				opal.fileReferences.model3.FileReferences.Motions[str].forEach(motionDef => {
					const name = motionDef.File.split('/')
						.find(s => s.endsWith('.motion3.json'))
						.replace('.motion3.json', '');
					const motion3Json = opal.fileReferences.motions[index];
					const clip = loadCubismMotionClipFromJson(cubismModel, motion3Json, name, idleNames.has(name));
					animator.clips.push(clip);
					index++;
				});
			}
		}

		ret.push(new CubismMotionComponent(animator));
	}

	// #endregion

	// #region Expressions
	if (options?.loadExpressions) {
		const animator = new CubismAnimator();

		if (opal.fileReferences.exp3 !== undefined) {
			opal.fileReferences.model3.FileReferences.Expressions.forEach((exp3Def, index) => {
				const name = exp3Def.Name.replace('.exp3.json', '');
				const clip = loadCubismExpressionFromJson(opal.fileReferences.exp3[index], name);
				animator.clips.push(clip);
			});
		}

		opal.fileReferences.cfgs?.forEach(f => {
			animator.clips.push(...loadCfgClipsFromFile(f));
		});
		ret.push(new CubismExpressionComponent(animator));
	}
	// #endregion

	// #region Physics
	if ((opal.fileReferences.physics3 ?? false) && options?.loadPhysics) {
		const phi3Comp = loadPhysicsComponent(cubismModel, opal.fileReferences.physics3);
		ret.push(phi3Comp);
	}
	// #endregion

	// #region Pose
	if (opal.fileReferences.pose3 !== undefined && options?.loadPose) {
		const poseComp = createCubismPose(cubismModel, opal.fileReferences.pose3);
		ret.push(poseComp);
	}
	// #endregion

	// #region UserData
	if (opal.fileReferences.userData3 !== undefined && options?.loadUserData) {
	}
	// #endregion

	// #region Cdi
	if (opal.fileReferences.cdi3 !== undefined && options?.loadCdi) {
		const cdiJson = opal.fileReferences.cdi3;
		const cdi = new CubismCdi();
		cdi.parameters = cdiJson.Parameters.map(parameter => ({
			id: parameter.Id,
			groupId: parameter.GroupId,
			name: parameter.Name,
		}));
		cdi.parameterGroups = cdiJson.ParameterGroups.map(group => ({
			id: group.Id,
			groupId: group.GroupId,
			name: group.Name,
		}));
		cdi.parts = cdiJson.Parts.map(part => ({
			id: part.Id,
			name: part.Name,
		}));
		ret.push(new CubismCdiComponent(cdi));
	}
	// #endregion

	const t2d = new Transform2DComponent(new Transform2D(new Matrix44()));
	// t2d.data.matrix.scale(0.8, 0.8);
	ret.push(t2d);
	return ret;
}

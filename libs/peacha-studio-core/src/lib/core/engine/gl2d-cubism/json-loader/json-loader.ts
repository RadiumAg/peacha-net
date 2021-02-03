import { NativeModel, Moc, loadEm } from '../live2dcubismcore';
import { CubismModel, CubismModelComponent } from '../model';
import { CubismRenderer } from '../render/renderer';
import { GL2DRenderComponent, Transform2DComponent, Transform2D, Matrix44 } from '../../gl2d';
import { createCubismPose } from '../pose/cubism-pose-component';
import { CubismAnimator, CubismMotionComponent, CubismExpressionComponent } from '../animation/animator';
import { loadCubismMotionClipFromJson } from './json-motion-loader';
import { CubismModelJson, CubismPoseJson, CubismPhysicsJson, CubismCDIJson } from './structures';
import { loadPhysicsComponent } from './json-physics-loader';
import { CubismCdi, CubismCdiComponent } from '../cdi/cubism-cdi-component';
import { loadCubismExpressionFromJson } from './json-expression-loader';
import { getCfgIdleAnimationNames, loadCfgClipsFromFile } from './json-cfg-pose-adapter';
import { FileNotFoundError, loadImageFromArrayBuffer, ReadableVirtualFileSystem, readStringToEnd, scaleImage } from '../../../vfs';
import { Component } from '../../ecs';

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

export function findModelEntryFile(f: string): boolean {
	return f.endsWith('.model3.json') && !f.startsWith('__MACOSX');
}

export function findCfgFile(f: string): boolean {
	return f.endsWith('.cfg') && f.includes('cc') && !f.startsWith('__MACOSX');
}

export function findMotionFile(f: string): boolean {
	return f.endsWith('.motion3.json') && !f.startsWith('__MACOSX');
}

export function findExpFile(f: string): boolean {
	return f.endsWith('.exp3.json') && !f.startsWith('__MACOSX');
}

export async function loadJsonModelFromVFS(
	gl: WebGLRenderingContext,
	vfs: ReadableVirtualFileSystem,
	options?: CubismLoaderOptions
): Promise<Component[]> {
	const ret = [];
	// #region Initial
	await loadEm();
	const file = await vfs.tryFindAndRead(findModelEntryFile);
	const model3json = JSON.parse(readStringToEnd(file)) as CubismModelJson;

	const mocBuffer = await vfs.read(model3json.FileReferences.Moc);
	const moc = Moc.fromArrayBuffer(mocBuffer);
	const nativeModel = NativeModel.fromMoc(moc);
	const cubismModel = new CubismModel(nativeModel);
	ret.push(new CubismModelComponent(cubismModel));
	// #endregion

	// #region Textures

	const textureMap = new Map<number, WebGLTexture>();
	const usePremultiply = true;
	for (let i = 0; i < model3json.FileReferences.Textures.length; i++) {
		const src = model3json.FileReferences.Textures[i];
		// load texture
		let imgDom: TexImageSource = await loadImageFromArrayBuffer(await vfs.read(src));
		const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		if (imgDom.width > gl.getParameter(gl.MAX_TEXTURE_SIZE) || imgDom.height > gl.getParameter(gl.MAX_TEXTURE_SIZE)) {
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
	if (options?.loadMotions) {
		const animator = new CubismAnimator();

		const idleNames = new Set<string>();

		for (const [, cfgPromises] of vfs.tryFindAndReadAll(findCfgFile)) {
			getCfgIdleAnimationNames(await cfgPromises).forEach(s => {
				idleNames.add(s);
			});
		}

		for (const item of vfs.tryFindAndReadAll(findMotionFile)) {
			if (item !== undefined) {
				const fileName = item[0];
				const cfgPromises = item[1];
				const motionName = fileName
					.split('/')
					.find(str => str.endsWith('.motion3.json'))
					.replace('.motion3.json', '');
				const motion3Json = JSON.parse(readStringToEnd(await cfgPromises));
				const clip = loadCubismMotionClipFromJson(cubismModel, motion3Json, motionName, idleNames.has(motionName));
				animator.clips.push(clip);
			}
		}

		for (const str in model3json.FileReferences.Motions) {
			if (str !== undefined) {
				for (const motionDef of model3json.FileReferences.Motions[str]) {
					try {
						await vfs.read(motionDef.File);
					} catch (e) {
						throw new FileNotFoundError('未找到对应的motions3.json文件');
					}
				}
			}
		}

		ret.push(new CubismMotionComponent(animator));
	}

	// #endregion

	// #region Expressions
	if (options?.loadExpressions) {
		const animator = new CubismAnimator();

		for (const [fileName, filePromises] of vfs.tryFindAndReadAll(findExpFile)) {
			const expName = fileName
				.split('/')
				.find(str => str.endsWith('.exp3.json'))
				.replace('.exp3.json', '');
			const exp3Json = JSON.parse(readStringToEnd(await filePromises));
			const clip = loadCubismExpressionFromJson(exp3Json, expName);
			animator.clips.push(clip);
		}

		if (model3json.FileReferences.Expressions !== undefined) {
			for (const exp3Def of model3json.FileReferences.Expressions) {
				try {
					await vfs.read(exp3Def.File);
				} catch (e) {
					throw new FileNotFoundError('未找到对应的exp3.json文件');
				}
			}
		}

		// load cfg
		for (const [fileName, cfgPromises] of vfs.tryFindAndReadAll(findCfgFile)) {
			animator.clips.push(...loadCfgClipsFromFile(await cfgPromises));
		}

		ret.push(new CubismExpressionComponent(animator));
	}
	// #endregion

	// #region Physics

	if ((model3json.FileReferences.Physics ?? false) && options?.loadPhysics) {
		const phiFile = await vfs.read(model3json.FileReferences.Physics);
		const phi3json = JSON.parse(readStringToEnd(phiFile)) as CubismPhysicsJson;
		const phi3Comp = loadPhysicsComponent(cubismModel, phi3json);
		ret.push(phi3Comp);
	}
	// #endregion

	// #region Pose
	if (model3json.FileReferences.Pose !== undefined && options?.loadPose) {
		const poseFile = await vfs.read(model3json.FileReferences.Pose);
		const pose3json = JSON.parse(readStringToEnd(poseFile)) as CubismPoseJson;
		const poseComp = createCubismPose(cubismModel, pose3json);
		ret.push(poseComp);
	}
	// #endregion

	// #region UserData
	if (model3json.FileReferences.UserData !== undefined && options?.loadUserData) {
		// const udFile = await vfs.read(model3json.FileReferences.UserData);
		// const ud3json = JSON.parse(readStringToEnd(udFile)) as CubismUserDataJson;
	}
	// #endregion

	// #region Cdi
	if (model3json.FileReferences.DisplayInfo !== undefined && options?.loadCdi) {
		const cdiFile = await vfs.read(model3json.FileReferences.DisplayInfo);
		const cdiJson = JSON.parse(readStringToEnd(cdiFile)) as CubismCDIJson;
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

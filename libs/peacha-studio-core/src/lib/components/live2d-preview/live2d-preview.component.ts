/* eslint-disable @angular-eslint/no-output-native */
import { Live2dTransformData } from '../../live2d-transform-data';
import {
	Component,
	ElementRef,
	ViewChild,
	Injector,
	Input,
	Output,
	EventEmitter,
	ChangeDetectorRef,
	HostListener,
	AfterViewInit,
	OnDestroy,
	ChangeDetectionStrategy,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { SliderParam } from './setting-panel/slider/slider.component';
import { trigger, transition, style, animate } from '@angular/animations';
import {
	coroutineFaceTrack,
	DomKeyboardSystem,
	DomMouseSystem,
	Entity,
	EventHub,
	GL2DRenderingContext,
	GL2DRenderingSystem,
	HTMLTrackerFactory,
	Keyboard,
	Mouse,
	PlatformFaceTracker,
	PLATFORM_FT_FACTORY,
	Shortcuts,
	ShortcutSystem,
	Transform2D,
	Transform2DComponent,
	World,
} from '../../core/engine';
import {
	CubismAnimationAction,
	CubismAnimationSystem,
	CubismAnimator,
	CubismCdiComponent,
	CubismDragSystem,
	CubismExpressionComponent,
	CubismExpressionSystem,
	CubismModel,
	CubismModelComponent,
	CubismModelEmulateSystem,
	CubismMotionComponent,
	CubismPhysicsSystem,
	HostModel,
	HostModelComponent,
	HostModelSystem,
	loadJsonModelFromVFS,
	loadOpalModelFromVFS,
	PreserveParameterSaveSystem,
} from '../../core/engine/gl2d-cubism';
import { ReadableVirtualFileSystem } from '../../core/vfs';

export function getEasingSine(value: number): number {
	if (value < 0) {
		return 0;
	} else if (value > 1) {
		return 1;
	}
	return 0.5 - 0.5 * Math.cos(value * Math.PI);
}

export function isDocumentInFullScreenMode(): boolean {
	return document.fullscreenElement !== null;
}

@Component({
	selector: 'peacha-live2d-preview',
	templateUrl: './live2d-preview.component.html',
	styleUrls: ['./live2d-preview.component.less'],
	providers: [
		{
			provide: PLATFORM_FT_FACTORY,
			useValue: HTMLTrackerFactory,
		},
	],
	animations: [
		trigger('modalEnterLeaveTrigger', [
			transition(':enter', [style({ opacity: 0 }), animate('100ms', style({ opacity: 1 }))]),
			transition(':leave', [animate('100ms', style({ opacity: 0 }))]),
		]),
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Live2dPreviewComponent implements AfterViewInit, OnDestroy {
	@ViewChild('canvas') canvas!: ElementRef;

	@Input()
	width!: number;

	@Input()
	height!: number;

	@Input()
	fileType!: 'zip' | 'opal';

	@Input()
	enableFaceTracker!: boolean;

	@Input()
	enableSettingPanel!: boolean;

	@Input()
	transformData!: Live2dTransformData;

	_vfs!: ReadableVirtualFileSystem;
	@Input()
	set vfs(v: ReadableVirtualFileSystem) {
		this._vfs = v;
		if (this.canvas) {
			this.reloadModel().then();
		}
	}
	get vfs(): ReadableVirtualFileSystem {
		return this._vfs;
	}

	@Output()
	error = new EventEmitter<Error>();

	@Output()
	ok = new EventEmitter();

	//#region animation params
	fullScreen = false;
	animationPanelShow = false;
	settingPanelShow = false;
	modalShow = false;
	followMouse = true;
	//#endregion

	//#region ecs
	world!: World | null;
	scene!: GL2DRenderingContext;
	entity!: Entity | null;
	model!: CubismModel;
	transform!: Transform2D;
	//#endregion

	//#region model params
	parameterValues: Map<number, SliderParam> = new Map();
	partOpacities: Map<number, SliderParam> = new Map();
	allParamsLocked = false;
	//#endregion

	//#region others
	loading$ = new BehaviorSubject(true);
	error$ = new BehaviorSubject(false);
	cameraDevices$ = new BehaviorSubject<
		{
			id: string;
			label: string;
		}[]
	>([]);
	selectDevice!: string;
	cs!: AbortController | null;
	tracker!: PlatformFaceTracker;
	motionAnimator!: CubismAnimator;
	expressionAnimator!: CubismAnimator;
	motionAction!: CubismAnimationAction | null;
	expressionActions = new Map<number, CubismAnimationAction>();
	blendshapes = new Map<number, number>();
	//#endregion

	//#region dofade
	fadeDefaultTime = 1000;
	parameterValuesFadeStartTime!: number | null;
	partOpacitiesFadeStartTime!: number | null;

	ticker!: number;

	constructor(private elementRef: ElementRef, private injector: Injector, private changeDetectorRef: ChangeDetectorRef) {}
	@HostListener('fullscreenchange')
	onFullScreen(): void {
		if (isDocumentInFullScreenMode()) {
			const width = window.screen.width;
			const height = window.screen.height;
			this.canvas.nativeElement.width = width;
			this.canvas.nativeElement.height = height;
		} else {
			this.canvas.nativeElement.width = this.width;
			this.canvas.nativeElement.height = this.height;
		}
		this.scene.resizeFromCanvas(this.canvas.nativeElement);
	}

	@HostListener('mousemove', ['$event'])
	onMouseMove(event: MouseEvent): void {
		const width = isDocumentInFullScreenMode() ? window.screen.width : 1200;
		const height = isDocumentInFullScreenMode() ? window.screen.height : 600;
		const offsetX = ((event.offsetX - width / 2) / width) * 2;
		const offsetY = ((event.offsetY - height / 2) / height) * 2;
		if (this.followMouse && !this.cs) {
			if (this.model && (event.target as HTMLElement).localName === 'canvas') {
				this.blendshapes.set(
					this.model.PARAM_ANGLE_X,
					this.model.getParameterMaximumValueByIndex(this.model.PARAM_ANGLE_X) * offsetX
				);
				this.blendshapes.set(
					this.model.PARAM_ANGLE_Y,
					-this.model.getParameterMaximumValueByIndex(this.model.PARAM_ANGLE_Y) * offsetY
				);
				this.blendshapes.set(
					this.model.PARAM_ANGLE_Z,
					this.model.getParameterMaximumValueByIndex(this.model.PARAM_ANGLE_Z) * offsetX * offsetY
				);
				this.blendshapes.set(
					this.model.PARAM_BODY_ANGLE_X,
					this.model.getParameterMaximumValueByIndex(this.model.PARAM_BODY_ANGLE_X) * offsetX
				);
				this.blendshapes.set(
					this.model.PARAM_BODY_ANGLE_Y,
					-this.model.getParameterMaximumValueByIndex(this.model.PARAM_BODY_ANGLE_Y) * offsetY
				);
				this.blendshapes.set(
					this.model.PARAM_BODY_ANGLE_Z,
					this.model.getParameterMaximumValueByIndex(this.model.PARAM_BODY_ANGLE_Z) * offsetX * offsetY
				);
				this.blendshapes.set(this.model.PARAM_EYE_BALL_X, offsetX);
				this.blendshapes.set(this.model.PARAM_EYE_BALL_Y, -offsetY);
			}
		}
	}

	@HostListener('mouseleave')
	onMouseLeave(): void {
		if (this.followMouse && !this.cs) {
			this.blendshapes.clear();
			this.parameterValuesFadeStartTime = performance.now();
		}
	}

	onParameterValuesUpdate(params: SliderParam): void {
		this.parameterValues.get(params.index).lock = params.lock;
		this.parameterValues.get(params.index).value = params.value;
	}

	onPartOpacitiesUpdateUpdate(params: SliderParam): void {
		this.partOpacities.get(params.index).lock = params.lock;
		this.partOpacities.get(params.index).value = params.value;
	}

	async reloadModel(): Promise<void> {
		this.loading$.next(true);
		if (this.world) {
			this.world.removeEntity(this.entity);
			this.entity = null;
			this.world.destroy();
			this.world = null;
		}
		this.world = World.create({
			singletonComponent: [Keyboard, Mouse, Shortcuts, EventHub, GL2DRenderingContext, HostModel],
			systems: [
				DomKeyboardSystem,
				DomMouseSystem,
				ShortcutSystem,
				PreserveParameterSaveSystem,
				CubismExpressionSystem,
				CubismAnimationSystem,
				CubismDragSystem,
				CubismPhysicsSystem,
				CubismModelEmulateSystem,
				HostModelSystem,
				GL2DRenderingSystem,
				PreserveParameterSaveSystem,
			],
			rootDomElement: this.canvas.nativeElement,
			parentInjector: this.injector,
		});
		this.scene = this.world.get(GL2DRenderingContext);
		if (isDocumentInFullScreenMode()) {
			const width = window.screen.width;
			const height = window.screen.height;
			this.canvas.nativeElement.width = width;
			this.canvas.nativeElement.height = height;
		} else {
			this.canvas.nativeElement.width = this.width;
			this.canvas.nativeElement.height = this.height;
		}
		this.scene.resizeFromCanvas(this.canvas.nativeElement);
		const k =
			this.fileType === 'zip'
				? await loadJsonModelFromVFS(this.scene.gl, this.vfs, {
						loadRenderer: true,
						loadPose: true,
						loadMotions: true,
						loadExpressions: true,
						loadPhysics: true,
						loadCdi: true,
				  })
				: this.fileType === 'opal'
				? await loadOpalModelFromVFS(this.scene.gl, this.vfs, {
						loadRenderer: true,
						loadPose: true,
						loadMotions: true,
						loadExpressions: true,
						loadPhysics: true,
						loadCdi: true,
				  })
				: [];
		this.entity = this.world.addEntity(...k, new HostModelComponent(0));
		const cdi = CubismCdiComponent.oneFrom(this.entity)?.data;
		this.model = CubismModelComponent.oneFrom(this.entity).data;

		this.parameterValues.clear();
		this.partOpacities.clear();
		Array.from(this.model.parameterIdMap.entries()).forEach(entry => {
			this.parameterValues.set(entry[1], {
				lock: false,
				id: entry[0],
				index: entry[1],
				value: this.model.getParameterByIndex(entry[1]),
				min: this.model.getParameterMinimumValueByIndex(entry[1]),
				max: this.model.getParameterMaximumValueByIndex(entry[1]),
				default: this.model.getParameterDefaultValueByIndex(entry[1]),
				name: cdi?.getParameterById(entry[0]).name,
			});
		});
		Array.from(this.model.partIdMap.entries()).forEach(entry => {
			this.partOpacities.set(entry[1], {
				lock: false,
				id: entry[0],
				index: entry[1],
				value: this.model.getPartOpacityByIndex(entry[1]),
				min: 0,
				max: 1,
				default: this.model.getPartOpacityByIndex(entry[1]),
				name: cdi?.getPartById(entry[0]).name,
			});
		});
		this.motionAnimator = CubismMotionComponent.oneFrom(this.entity)?.data;
		this.expressionAnimator = CubismExpressionComponent.oneFrom(this.entity)?.data;
		this.transform = Transform2DComponent.oneFrom(this.entity).data;
		this.transform.matrix.scale(0.7, 0.7);

		// 载入预设数据
		this.recoverTransformData(this.transformData);
		this.loading$.next(false);
	}

	getTransformData(): Live2dTransformData | null {
		if (this.model) {
			return {
				position: this.transform.position,
				scale: this.transform.scale,
			};
		} else {
			return null;
		}
	}

	recoverTransformData(data: Live2dTransformData): void {
		if (data?.position && data?.scale && this.transform) {
			this.transform.position = data.position;
			this.transform.scale = data.scale;
		}
	}

	parameterValuesDoFade(): void {
		if (this.parameterValuesFadeStartTime) {
			const time = performance.now();
			const timeFromStart = time - this.parameterValuesFadeStartTime;
			const fadeDefault = getEasingSine((this.fadeDefaultTime - timeFromStart) / this.fadeDefaultTime);
			if (fadeDefault <= 1 && fadeDefault > 0) {
				this.parameterValues.forEach((parameterValue, index) => {
					this.parameterValues.get(index).value =
						(this.parameterValues.get(index).value - parameterValue.default) * fadeDefault + parameterValue.default;
				});
			} else if (fadeDefault === 0) {
				this.parameterValuesFadeStartTime = null;
			}
		}
	}

	partOpacitiesDoFade(): void {
		if (this.partOpacitiesFadeStartTime) {
			const time = performance.now();
			const timeFromStart = time - this.partOpacitiesFadeStartTime;
			const fadeDefault = getEasingSine((this.fadeDefaultTime - timeFromStart) / this.fadeDefaultTime);
			if (fadeDefault <= 1 && fadeDefault > 0) {
				this.partOpacities.forEach((partOpacity, index) => {
					this.partOpacities.get(index).value = partOpacity.default;
				});
			} else if (fadeDefault === 0) {
				this.partOpacitiesFadeStartTime = null;
			}
		}
	}

	resetAnimation(): void {
		if (this.motionAction) {
			this.motionAnimator.terminate(this.motionAction);
		}
		this.expressionActions.forEach(action => {
			this.expressionAnimator.terminate(action);
		});
		this.motionAction = null;
		this.expressionActions.clear();

		this.parameterValuesFadeStartTime = performance.now();
		this.partOpacitiesFadeStartTime = performance.now();
	}

	tick(): void {
		if (!this.world) {
			return;
		}
		if (isDocumentInFullScreenMode()) {
			const width = window.screen.width;
			const height = window.screen.height;
			this.canvas.nativeElement.width = width;
			this.canvas.nativeElement.height = height;
		} else {
			this.canvas.nativeElement.width = this.width;
			this.canvas.nativeElement.height = this.height;
		}
		this.scene.resizeFromCanvas(this.canvas.nativeElement);

		this.parameterValuesDoFade();
		this.partOpacitiesDoFade();
		this.parameterValues.forEach((parameterValue, index) => {
			if (this.blendshapes.has(parameterValue.index) && !parameterValue.lock) {
				this.parameterValues.get(index).value = this.blendshapes.get(parameterValue.index);
			}
			this.model.setParameterLockByIndex(parameterValue.index, false);
			this.model.setParameterByIndex(parameterValue.index, parameterValue.value);
			this.model.setParameterLockByIndex(parameterValue.index, parameterValue.lock);
		});
		this.partOpacities.forEach(partOpacity => {
			this.model.setPartLockByIndex(partOpacity.index, false);
			this.model.setPartOpacityByIndex(partOpacity.index, partOpacity.value);
			this.model.setPartLockByIndex(partOpacity.index, partOpacity.lock);
		});
		this.world.update();
		this.ticker = requestAnimationFrame(this.tick.bind(this));
		this.parameterValues.forEach((parameterValue, index) => {
			this.parameterValues.get(index).value = this.model.getParameterByIndex(parameterValue.index);
		});
		this.partOpacities.forEach((partOpacity, index) => {
			this.partOpacities.get(index).value = this.model.getPartOpacityByIndex(partOpacity.index);
		});
		this.changeDetectorRef.detectChanges();
	}

	wheel(event: Event): void {
		if ((event.target as HTMLElement).tagName === 'CANVAS') {
			event.preventDefault();
		}
	}

	async ngAfterViewInit(): Promise<void> {
		if (typeof WheelEvent !== 'undefined') {
			(this.elementRef.nativeElement as HTMLDivElement).addEventListener('mousewheel', this.wheel.bind(this));
		} else {
			(this.elementRef.nativeElement as HTMLDivElement).addEventListener('DOMMouseScroll', this.wheel.bind(this));
		}
		try {
			await this.reloadModel();
			this.ok.emit();
			requestAnimationFrame(this.tick.bind(this));
		} catch (e) {
			this.error.emit(e);
			this.error$.next(true);
		}
	}

	ngOnDestroy(): void {
		this.stopTracker();
		cancelAnimationFrame(this.ticker);
		this.world.destroy();
		this.world = null;
		if (typeof WheelEvent !== 'undefined') {
			(this.elementRef.nativeElement as HTMLDivElement).removeEventListener('mousewheel', this.wheel.bind(this));
		} else {
			(this.elementRef.nativeElement as HTMLDivElement).removeEventListener('DOMMouseScroll', this.wheel.bind(this));
		}
	}

	requestFollowMouse(): void {
		if (this.followMouse) {
			this.blendshapes.clear();
			this.parameterValuesFadeStartTime = performance.now();
		}
		this.followMouse = !this.followMouse;
	}

	async requestFullScreen(): Promise<void> {
		if (isDocumentInFullScreenMode()) {
			this.fullScreen = false;
			await document.exitFullscreen();
		} else {
			this.fullScreen = true;
			await (this.elementRef.nativeElement as HTMLDivElement).requestFullscreen();
		}
	}

	stopTracker(): void {
		if (this.cs) {
			this.cs.abort();
			this.tracker.release();
			this.blendshapes.clear();
		}
	}

	cancelRequestTracker(): void {
		this.modalShow = false;
	}

	startTracker(device: string): void {
		this.blendshapes.clear();
		this.modalShow = false;
		if (device.length > 0) {
			if (!this.cs) {
				this.tracker = this.injector.get(PLATFORM_FT_FACTORY)();
				this.cs = new AbortController();
				coroutineFaceTrack(
					this.tracker,
					{
						onfaceupdate: (face: number[]) => {
							this.blendshapes.set(this.model.PARAM_ANGLE_X, face[0]);
							this.blendshapes.set(this.model.PARAM_ANGLE_Y, face[1]);
							this.blendshapes.set(this.model.PARAM_ANGLE_Z, face[2]);
							this.blendshapes.set(this.model.PARAM_BODY_ANGLE_X, face[3]);
							this.blendshapes.set(this.model.PARAM_BODY_ANGLE_Y, face[4]);
							this.blendshapes.set(this.model.PARAM_BODY_ANGLE_Z, face[5]);
							this.blendshapes.set(this.model.PARAM_EYE_BALL_X, face[6]);
							this.blendshapes.set(this.model.PARAM_EYE_BALL_Y, face[7]);
							this.blendshapes.set(this.model.PARAM_EYE_LEFT_OPEN, face[8]);
							this.blendshapes.set(this.model.PARAM_EYE_RIGHT_OPEN, face[9]);
							this.blendshapes.set(this.model.PARAM_BROW_LEFT_Y, face[10]);
							this.blendshapes.set(this.model.PARAM_BROW_RIGHT_Y, face[11]);
							this.blendshapes.set(this.model.PARAM_BROW_LEFT_ANGLE, face[12]);
							this.blendshapes.set(this.model.PARAM_BROW_RIGHT_ANGLE, face[13]);
							this.blendshapes.set(this.model.PARAM_BROW_LEFT_FORM, face[14]);
							this.blendshapes.set(this.model.PARAM_BROW_RIGHT_FORM, face[15]);
							this.blendshapes.set(this.model.PARAM_MOUTH_FORM, face[16]);
							this.blendshapes.set(this.model.PARAM_MOUTH_OPEN_Y, face[17]);
						},
						onrequestdevice: async () => {
							return device;
						},
					},
					this.cs
				)
					.catch(e => {
						console.error(e);
					})
					.finally(() => {
						this.cs = null;
					});
			}
		}
	}

	async requestTracker(): Promise<void> {
		if (this.cs) {
			this.stopTracker();
		} else {
			this.modalShow = true;
			const devices = await navigator.mediaDevices.enumerateDevices();
			this.cameraDevices$.next(
				devices
					.filter(device => device.kind === 'videoinput')
					.map((device, index) => ({
						id: device.deviceId || device.groupId,
						label: device.label || `camera device ${index}`,
					}))
			);
		}
	}

	playMotion(index: number): void {
		this.motionAction = this.motionAnimator.start(this.motionAnimator.clips[index]);
	}

	playExpression(index: number): void {
		if (this.expressionActions.has(index)) {
			this.expressionAnimator.terminate(this.expressionActions.get(index));
			this.expressionActions.delete(index);
			this.parameterValuesFadeStartTime = performance.now();
			this.partOpacitiesFadeStartTime = performance.now();
		} else {
			this.expressionActions.set(index, this.expressionAnimator.start(this.expressionAnimator.clips[index]));
		}
	}
}

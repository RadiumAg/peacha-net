import { Component, ViewChild, ElementRef, Input, Injector, AfterViewInit, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ReadableVirtualFileSystem } from '../../core';
import {
	Entity,
	EventHub,
	GL2DRenderingContext,
	GL2DRenderingSystem,
	HTMLTrackerFactory,
	PLATFORM_FT_FACTORY,
	Transform2DComponent,
	World,
} from '../../core/engine';
import {
	CubismAnimationSystem,
	CubismExpressionSystem,
	CubismModel,
	CubismModelComponent,
	CubismModelEmulateSystem,
	CubismPhysicsSystem,
	HostModel,
	HostModelComponent,
	loadOpalModelFromVFS,
	PreserveParameterSaveSystem,
} from '../../core/engine/gl2d-cubism';

@Component({
	selector: 'peacha-live2d-preview-min',
	templateUrl: './live2d-preview-min.component.html',
	styleUrls: ['./live2d-preview-min.component.less'],
	providers: [
		{
			provide: PLATFORM_FT_FACTORY,
			useValue: HTMLTrackerFactory,
		},
	],
})
export class Live2dPreviewMinComponent implements AfterViewInit, OnDestroy {
	@ViewChild('canvas')
	canvas!: ElementRef;
	@Input()
	width!: number;

	@Input()
	height!: number;
	@Input()
	vfs!: ReadableVirtualFileSystem;

	world!: World | null;
	scene!: GL2DRenderingContext;
	entity!: Entity;
	model!: CubismModel;

	loading$ = new BehaviorSubject(true);
	error$ = new BehaviorSubject(false);

	ticker!: number;

	constructor(private injector: Injector) {}

	async ngAfterViewInit() {
		this.world = World.create({
			singletonComponent: [EventHub, GL2DRenderingContext, HostModel],
			systems: [
				PreserveParameterSaveSystem,
				CubismExpressionSystem,
				CubismAnimationSystem,
				// CubismPoseSystem,
				CubismPhysicsSystem,
				CubismModelEmulateSystem,
				GL2DRenderingSystem,
				PreserveParameterSaveSystem,
			],
			rootDomElement: this.canvas.nativeElement,
			parentInjector: this.injector,
		});
		this.scene = this.world.get(GL2DRenderingContext);
		this.canvas.nativeElement.width = this.width;
		this.canvas.nativeElement.height = this.height;
		this.scene.resizeFromCanvas(this.canvas.nativeElement);
		const k = await loadOpalModelFromVFS(this.scene.gl, this.vfs, {
			loadRenderer: true,
			loadPose: true,
			loadMotions: true,
			loadExpressions: true,
			loadPhysics: true,
			loadCdi: true,
		});
		this.entity = this.world.addEntity(...k, new HostModelComponent(0));
		this.model = CubismModelComponent.oneFrom(this.entity).data;
		const transform = Transform2DComponent.oneFrom(this.entity).data;
		transform.matrix.scale(3.5, 3.5);
		this.loading$.next(false);
		requestAnimationFrame(this.tick.bind(this));

		document.addEventListener('mousemove', this.mouseMove.bind(this));
	}

	mouseMove(event: MouseEvent) {
		this.model.setParameterByIndex(this.model.PARAM_ANGLE_X, ((event.clientX - (screen.width - 20 - 150)) / screen.width) * 30);
		this.model.setParameterByIndex(this.model.PARAM_ANGLE_Y, -((event.clientY - (screen.height - 200)) / screen.height) * 30);
		this.model.setParameterByIndex(this.model.PARAM_BODY_ANGLE_X, ((event.clientX - (screen.width - 20 - 150)) / screen.width) * 10);
		this.model.setParameterByIndex(this.model.PARAM_BODY_ANGLE_Y, -((event.clientY - (screen.height - 200)) / screen.height) * 10);
		this.model.setParameterByIndex(this.model.PARAM_EYE_BALL_X, (event.clientX - (screen.width - 20 - 150)) / screen.width);
		this.model.setParameterByIndex(this.model.PARAM_EYE_BALL_Y, -((event.clientY - (screen.height - 200)) / screen.height));
	}

	tick() {
		if (!this.world) {
			return;
		}
		this.world.update();
		this.ticker = requestAnimationFrame(this.tick.bind(this));
	}

	ngOnDestroy(): void {
		cancelAnimationFrame(this.ticker);
		this.world?.destroy();
		this.world = null;
		document.removeEventListener('mousemove', this.mouseMove.bind(this));
	}
}

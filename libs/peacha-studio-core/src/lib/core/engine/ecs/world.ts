import { InjectionToken, StaticProvider, Injector, Type } from '@angular/core';
import { SystemBase, SystemType } from './system';
import { Entity } from './entity';
import { Component, SingletonComponentType } from './component';

export const DOM_ELEMENT = new InjectionToken<HTMLCanvasElement | HTMLElement>('DOM_ELEMENT');

const now = performance.now.bind(self.performance);

export class World {
	constructor() {
		this.lastFrame = now();
		this.systems = [];
	}

	injector: Injector;

	/**
	 * 执行顺序严格
	 */
	systems: Array<SystemBase>;

	entities: {
		[entityId: number]: Entity;
	} = {};

	entityIndices: {
		[entityId: number]: SystemBase[];
	} = {};

	private systemReactiveCache: {
		[systemId: number]: Entity[];
	} = {};

	systemVersion: {
		[systemId: number]: number;
	} = {};

	lastFrame = 0;
	frameCount = 0;

	worldTime = 0;

	static create(config?: {
		systems?: SystemType[];
		singletonComponent?: SingletonComponentType[];
		providers?: StaticProvider[];
		parentInjector?: Injector;
		rootDomElement: HTMLElement;
	}): World {
		const world = new World();

		const globalProviders: StaticProvider[] = [
			{
				provide: DOM_ELEMENT,
				useValue: config.rootDomElement,
			},
			{
				provide: World,
				useValue: world,
			},
		];

		// singleton components

		const singletonComponentProviders = config?.singletonComponent?.map(s => {
			return {
				provide: s,
				useValue: new s(),
			};
		});

		const systemProviders = config?.systems?.map(s => {
			return {
				provide: s,
				useClass: s,
			};
		});

		const injector = Injector.create(
			[...(systemProviders ?? []), ...(singletonComponentProviders ?? []), ...(config.providers ?? []), ...globalProviders],
			config.parentInjector
		);
		world.injector = injector;

		config.systems
			.map(s => injector.get(s))
			.forEach((systemInstance: SystemBase) => {
				world.systems.push(systemInstance);
				world.systemVersion[systemInstance.id] = 0;
				world.systemReactiveCache[systemInstance.id] = [];
			});

		return world;
	}

	update(): void {
		const current = now();
		const elapsed = current - this.lastFrame;
		this.lastFrame = current;
		const worldTime = (this.worldTime += elapsed);
		this.frameCount++;

		for (const system of this.systems) {
			if (!system.active) {
				continue;
			}
			system.allBeforeUpdate?.(elapsed, this.worldTime);
			const d = this.systemReactiveCache[system.id];
			if (system.query) {
				for (const entity of d) {
					system.update?.(entity, elapsed, worldTime);
				}
			}
			system.__generatorTick();
			system.allAfterUpdate?.(d);
		}
	}

	addEntity(...components: Component[]): Entity {
		const entity = new Entity(components);
		this.entities[entity.id] = entity;
		//  生成entityindex
		// 对比所有system的interest
		this.systems.forEach(system => {
			if (system.query && isSystemInterestedInEntity(system, entity)) {
				this.entityIndices[entity.id] = this.entityIndices[entity.id] ? [system, ...this.entityIndices[entity.id]] : [system]; // todo

				if (system.enter) {
					system.enter(entity);
				}
				this.systemVersion[system.id]++;
				this.systemReactiveCache[system.id].push(entity);
			}
		});

		return entity;
	}

	removeEntity(entity: Entity): void {
		this.entityIndices[entity.id].forEach(system => {
			if (system.exit) {
				system.exit(entity);
			}
			this.systemVersion[system.id]++;
			this.systemReactiveCache[system.id].splice(this.systemReactiveCache[system.id].indexOf(entity), 1);
		});
		delete this.entities[entity.id];
		delete this.entityIndices[entity.id];
	}

	/**
	 * 这方法写的有点烂
	 * @param entity
	 * @param comp
	 */
	reformEntity(entity: Entity, comp: Component[]): void {
		this.entityIndices[entity.id].forEach(system => {
			if (system.exit) {
				system.exit(entity);
			}
			this.systemVersion[system.id]++;
			this.systemReactiveCache[system.id].splice(this.systemReactiveCache[system.id].indexOf(entity), 1);
		});
		entity.components = {};
		comp.forEach(c => {
			if (entity.components[c.type] != undefined) {
				entity.components[c.type].push(c);
			} else {
				entity.components[c.type] = [c];
			}
		});
		this.systems.forEach(system => {
			if (system.query && isSystemInterestedInEntity(system, entity)) {
				this.entityIndices[entity.id] = this.entityIndices[entity.id] ? [system, ...this.entityIndices[entity.id]] : [system]; // todo

				if (system.enter) {
					system.enter(entity);
				}
				this.systemVersion[system.id]++;
				this.systemReactiveCache[system.id].push(entity);
			}
		});
	}

	get<T>(token: Type<T>): T {
		return this.injector.get(token) as T;
	}

	destroy(): void {
		this.systems.forEach(system => {
			system.onDestroy?.();
		});
	}
}

function isSystemInterestedInEntity(system: SystemBase, entity: Entity): boolean {
	for (let ele = 0; ele < system.query.length; ele++) {
		const element = system.query[ele];
		if (entity.components[element.type] === undefined) {
			return false;
		}
	}
	return true;
}

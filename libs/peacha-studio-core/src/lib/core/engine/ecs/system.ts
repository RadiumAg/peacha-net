import { Entity } from './entity';
import { ComponentType } from './component';
import { Injectable } from '@angular/core';

export type Query = ComponentType[];

export const System = Injectable;

export declare type SystemType<T = any> = new (...args: any[]) => T;

export abstract class SystemBase {
	constructor(
		/**
		 * 如果为空，此System将全局生效
		 */
		public query?: Query
	) {
		this.id = SystemBase.SEQ_SYSTEM++;
		query?.sort((a, b) => {
			return a.type - b.type;
		});
		this.active = true;
	}

	private static SEQ_SYSTEM = 0;

	public readonly id: number;

	active: boolean;

	array: Generator[] = [];

	allBeforeUpdate?(delta?: number, world?: number): void;

	allAfterUpdate?(entities?: Entity[]): void;

	onDestroy?(): void;

	update?(entity: Entity, delta: number, time: number): void;

	enter?(entity: Entity): void;

	exit?(entity: Entity): void;

	/* Coroutines */

	__generatorTick(): void {
		for (const generator of this.array) {
			const ret = generator.next();
			// todo: return :  WaitTicks(...) WaitSeconds(...)
			if (ret.done) {
				this.array.splice(this.array.indexOf(generator), 1);
			}
		}
	}

	startCoroutine(generator: Generator): void {
		// generator.next();
		this.array.push(generator);
	}
}

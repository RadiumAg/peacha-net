import { Entity } from './entity';
import { Injectable } from '@angular/core';

/**
 * 我就看看能不能把之前的覆盖掉
 */
export const SingletonComponent = Injectable;

export declare type SingletonComponentType<T = any> = new() => T;

export type ComponentType<P = any> = (new (data: P) => Component<P>) & {
    type: number;

    allFrom(entity: Entity): Component<P>[];

    oneFrom(entity: Entity): Component<P>;
};

export abstract class Component<T = any> {

    private static SEQ_COMPONENT = 0;

    public attr: {
        [key: string]: any;
    } = {};

    constructor(public type: number, public data: T) { }

    public static register<P>(): ComponentType<P> {
        const typeId = Component.SEQ_COMPONENT++;

        class ComponentImpl extends Component<P> {
            static type = typeId;

            static allFrom(entity: Entity): ComponentImpl[] {
                return entity.components[typeId] ?? [];
            }

            static oneFrom(entity: Entity): ComponentImpl {
                return entity.components[typeId]?.[0];
            }

            constructor(data: P) {
                super(typeId, data);
            }
        }

        return ComponentImpl as ComponentType<P>;
    }
}

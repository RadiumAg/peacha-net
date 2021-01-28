import { Component } from './component';

export class Entity {

    private static SEQ_ENTITY = 0;

    components: {
        [key: number]: Component[];
    } = {};

    public readonly id: number;

    constructor(comp: Component[]){
        this.id = Entity.SEQ_ENTITY++;
        comp.forEach(c => {
            if (this.components[c.type] != undefined){
                this.components[c.type].push(c);
            }else{
                this.components[c.type] = [c];
            }
        });
    }
}

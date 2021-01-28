import { Component } from '../../ecs';

export class CubismCdi {
    parameters: {
        id: string,
        groupId: string,
        name: string
    }[];
    parameterGroups: {
        id: string,
        groupId: string,
        name: string
    }[];
    parts: {
        id: string,
        name: string
    }[];

    constructor() {
        this.parameters = [];
        this.parameterGroups = [];
        this.parts = [];
    }

    getParameterById(id: string): {
      id: string;
      groupId: string;
      name: string;
  } {
        return this.parameters.find(parameter => parameter.id === id);
    }

    getParameterGroupById(id: string): {
      id: string;
      groupId: string;
      name: string;
  } {
        return this.parameterGroups.find(group => group.id === id);
    }

    getPartById(id: string): {
      id: string;
      name: string;
  } {
        return this.parts.find(part => part.id === id);
    }
}

export const CubismCdiComponent = Component.register<CubismCdi>();

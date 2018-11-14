import { ToolKit } from '../toolkit';

export interface Coords {
    x: number;
    y: number;
}

export interface CharacterCoords {
    character: number;
    x: number;
    y: number;
}

export interface MapArea {
    complexity: number;
    points: number[][];
}

export class MapDescription {
    height: number = 0;
    width: number = 0;
    character: string[] = [];
    areas: MapArea[] = [];

    static mapFromObject(obj: any): MapDescription {
        let instance = new MapDescription();
        ToolKit.mapToDeepObject(instance, obj, { strictMapping: true });
        return instance;
    }
}
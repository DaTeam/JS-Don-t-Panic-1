let { createCanvas, loadImage } = require('canvas');
import { resolve as resolvePath } from 'path';
import { writeFileSync } from 'fs';
import { ToolKit } from '../toolkit';
import { MapDescription, CharacterCoords, Coords } from './mapDescription';
import { Map } from './map';
import { Character } from './character/character';
import { Vogon } from './character/vogon';
import { Marvin } from './character/marvin';
import { ArthurDent } from './character/arthurDent';

const CHARACTERS: { [name: string]: Character } = {
    'MARVIN': new Marvin(),
    'VOGON': new Vogon(),
    'ARTHURDENT': new ArthurDent()
};

export const MAP_STORAGE_PATH = 'map/generated/';

export class MapHelper {
    public static generateMap(mapDesc: MapDescription): Map {
        let newMap = new Map(mapDesc);
        let availablePoints = MapHelper.calculateAvailablePoints(newMap);

        // Random marvin position
        let marvinCharacter = MapHelper.getCharacter('MARVIN');
        let marvinPointIndex = Math.floor(Math.random() * availablePoints.length) + 2;

        // Random other character
        let allowedCharacter: Character[] = newMap.desc.character.map(name => MapHelper.getCharacter(name));
        let points: CharacterCoords[] = [];
        for (let i = 0; i < availablePoints.length; i++) {
            if (i === marvinPointIndex) {
                let marvinCoord = { x: availablePoints[i].x, y: availablePoints[i].y, character: marvinCharacter.key };
                points.push(marvinCoord);
                newMap.setMarvin(marvinCoord);
                continue;
            }

            let characterIndex = Math.floor(Math.random() * allowedCharacter.length);
            points.push({ x: availablePoints[i].x, y: availablePoints[i].y, character: allowedCharacter[characterIndex].key });
        }
        newMap.points = points;

        MapHelper.generacteSVGMap(newMap);
        return newMap;
    }

    public static generacteSVGMap(map: Map) {
        const canvas = createCanvas(map.desc.width, map.desc.height, 'svg');

        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, map.desc.width, map.desc.height);

        map.points.forEach(p => {
            let character = MapHelper.getCharacterByKey(p.character);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI, false);
            ctx.fillStyle = character!.color;
            ctx.fill();
        });

        
        writeFileSync(resolvePath(ToolKit.cast<any>(global).__rootdir, `${MAP_STORAGE_PATH}`, `${map.id}.svg`), canvas.toBuffer())
    }

    public static getCharacter(name: string): Character {
        return CHARACTERS[name];
    }

    public static getCharacterByKey(key: number): Character | null {
        for (let c in CHARACTERS) {
            if (CHARACTERS[c].key === key) {
                return CHARACTERS[c];
            }
        }

        return null;
    }

    private static calculateAvailablePoints(map: Map): Coords[] {
        let minY = 0;
        let maxY = map.desc.height;
        let minX = 0;
        let maxX = map.desc.width;
        let points: Coords[] = [];

        // On récupère la hauteur de début et de fin
        // for (let i = 0; i < points.length; i++) {
        //   if (minY === -1 || points[i][1] < minY) {
        //     minY = points[i][1];
        //   } else if (maxY === -1 || points[i][1] > maxY) {
        //     maxY = points[i][1];
        //   }
        // }

        let nextYOffset = 5;
        // On calcule les lignes a l'intérieur du polygone
        for (let y = minY; y < maxY; y += nextYOffset) {
            nextYOffset = Math.floor(Math.random() * 10) + 2;

            map.desc.areas.forEach(area => {
                let intersectPoints = MapHelper.checkPolygonCollision(minX, y, maxX, y, area.points);

                if (intersectPoints !== null && intersectPoints.length > 1) {
                    for (let p = 0; p < intersectPoints.length - 1; p += 2) {
                        let lineXOffset = 20;
                        let startPoint = Math.floor(Math.random() * 40) + intersectPoints[p + 1].x;
                        for (let lineX = startPoint; lineX < intersectPoints[p].x; lineX += lineXOffset) {
                            lineXOffset = Math.floor(Math.random() * 40) + 15;

                            points.push({ x: lineX, y: y });
                        }
                    }
                }
            });
        }

        return points;
    }

    private static checkPolygonCollision(x1: number, y1: number, x2: number, y2: number, points: number[][]) {
        let collisionPoints = [];
        for (let i = 0; i < points.length - 1; i++) {
            let intersect = MapHelper.checkIntersection(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], x1, y1, x2, y2);
            if (intersect !== null) {
                collisionPoints.push(intersect);
            }
        }
        let intersect = MapHelper.checkIntersection(points[points.length - 1][0], points[points.length - 1][1], points[0][0], points[0][1], x1, y1, x2, y2);
        if (intersect !== null) {
            collisionPoints.push(intersect);
        }

        return collisionPoints;
    }

    private static checkIntersection(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
        const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        if (denom === 0) {
            return null;
        }

        const uA = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
        const uB = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;

        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            return {
                x: x1 + (uA * (x2 - x1)),
                y: y1 + (uA * (y2 - y1))
            };
        }

        return null;
    }
}
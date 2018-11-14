import { Map } from './map/map';
import * as map1 from './map/template/map1.json';
import { MapDescription } from './map/mapDescription';
import { MapHelper } from './map/mapHelper';

const config = {
    // mapLifetime: 10,
    // mapTimeout: 5
    mapLifetime: 180,
    mapTimeout: 30
}

const mapDesc1 = MapDescription.mapFromObject(map1);

export class GameManager {
    get currentMap(): Map {
        return this._currentMap;
    }

    private _currentMap: Map;
    private _nextMap: Map | null;
    private isRunning = false;

    start() {
        this.isRunning = true;
        this._launchGame();
    }

    stop() {
        this.isRunning = false;
    }

    async check(userEmail: string, x: number, y: number): Promise<boolean> {
        return await this._currentMap.check(userEmail, x, y);
    }

    private _launchGame() {
        this._startNewMap();
    }

    private _setGameDuration() {
        if (!this.isRunning) return;

        setTimeout(() => this._startDisplayingScore(), config.mapLifetime * 1000);
    }

    private _setScoreDuration() {
        if (!this.isRunning) return;

        setTimeout(() => this._startNewMap(), config.mapTimeout * 1000);
    }

    private _startNewMap() {
        if (this._nextMap instanceof Map) this._currentMap = this._nextMap;
        else this._currentMap = MapHelper.generateMap(mapDesc1);

        this._currentMap.startMap();
        this._setGameDuration();
    }

    private _startDisplayingScore() {
        this._nextMap = MapHelper.generateMap(mapDesc1);

        this._currentMap.completeMap();
        this._setScoreDuration();
    }
}

export let gameManager = new GameManager();
import { ToolKit } from '../toolkit';
import { MapDescription, CharacterCoords } from './mapDescription';
import { userService, ExportedUser } from '../service/userService';
import { Player } from '../models/player';

export class ExportedMap {
    id: string = '';
    date = new Date();
    startDate: Date | null = null;
    endDate: Date | null = null;
    players: Player[] = [];
    complexity: number = 0;

    static mapFromObject(obj: any): ExportedMap {
        let instance = new ExportedMap();
        ToolKit.mapToDeepObject(instance, obj, { strictMapping: true });
        return instance;
    }
}

export class Map {
    get id(): string { return this._id; }
    get date(): Date { return this._date; }
    get startDate(): Date | null { return this._startDate; }
    get endDate(): Date | null { return this._endDate; }
    get players(): Player[] { return this._players; }
    get desc(): MapDescription { return this._desc; }
    get marvinCoord(): CharacterCoords { return this._marvinCoord; }
    get complexity(): number { return this._complexity; }

    points: CharacterCoords[] = [];

    private _id: string;
    private _date = new Date();
    private _startDate: Date | null = null;
    private _endDate: Date | null = null;
    private _players: Player[] = [];
    private _desc: MapDescription;
    private _marvinCoord: CharacterCoords;
    private _complexity: number = 1;

    constructor(desc: MapDescription) {
        let id = Map.generateId();
        if (!ToolKit.isString(id) || !id.trim().length) throw new Error('id not valid.');
        if (!(desc instanceof MapDescription)) throw new Error('desc not valid.');

        this._id = id;
        this._desc = desc;
    }

    startMap() {
        this._startDate = new Date();
    }

    completeMap() {
        this._endDate = new Date();
    }

    setMarvin(coord: CharacterCoords) {
        this._marvinCoord = coord;
    }

    async check(userEmail: string, x: number, y: number): Promise<boolean> {
        if (!this._marvinCoord || ToolKit.isDate(this._endDate)) return false;

        let marvinX = this._marvinCoord.x;
        let marvinY = this._marvinCoord.y;
        let found = (marvinX > x - 5 && marvinX < x + 5
            && marvinY > y - 5 && marvinY < y + 5);
        console.log(marvinX, marvinY, found); // TODO: Remove (Demo debug only)
        if (!found) return false;

        let user = await userService.get(userEmail);
        if (!(user instanceof ExportedUser)) return Promise.reject(new Error('Unable to retrieve the current user.'));
        let foundEntry = this._players.find(player => player.username === user!.username);
        if (foundEntry) return Promise.reject(new Error('The user has already completed this map.'));

        await this.addPlayerResult(user);
        return true;
    }

    export(): ExportedMap {
        return ExportedMap.mapFromObject({
            id: this._id,
            date: this._date,
            startDate: this._startDate,
            endDate: this._endDate,
            players: this._players,
            complexity: this._complexity
        });
    }

    private async addPlayerResult(user: ExportedUser): Promise<Player> {
        let score = 10;
        let player = Player.mapFromObject({
            username: user.username,
            timer: new Date(),
            score
        });
        this.players.push(player);

        await userService.addScore(user.email, player.score);

        return player;
    }

    static generateId(): string {
        return '' + ToolKit.randomNumber(1, 99999); // TODO: add ID generation
    }
}
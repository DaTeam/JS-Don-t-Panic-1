import { ToolKit } from '../toolkit';

export class Player {
    username: string = '';
    timer: Date = new Date();
    score: number = 0;

    static mapFromObject(obj: any): Player {
        let instance = new Player();
        ToolKit.mapToDeepObject(instance, obj, { strictMapping: true });
        return instance;
    }
}
import { ToolKit } from '../toolkit';

export class User {
    username: string = '';
    email: string = '';
    password: string = '';
    score: number = 0;

    static mapFromObject(obj: any): User {
        let instance = new User();
        ToolKit.mapToDeepObject(instance, obj, { strictMapping: true });
        return instance;
    }
}
import { User } from '../models/user';
import { userRepository } from '../repository/userRepository';
import { ToolKit } from '../toolkit';

const DEFAULT_NAME_COLLECTION: string[] = [
    'Petit_lapin_du_',
    'Gros_bisounours_du_',
    'Booba_du_',
    'Kalash_du_',
    'Le_thug_du',
    'Princesse_du_'
];


export class ExportedUser {
    username: string;
    email: string;
    score: number;
}

export class UserService {
    constructor() { }

    async get(email: string): Promise<ExportedUser | null> {
        let user = await userRepository.get(email);
        return (user instanceof User) ? this._exportUser(user) : user;
    }

    async getByUsername(username: string): Promise<ExportedUser | null> {
        let user = await userRepository.getByUsername(username);
        return (user instanceof User) ? this._exportUser(user) : user;
    }

    async getAll(): Promise<ExportedUser[]> {
        return (await userRepository.getAll())
            .map(user => this._exportUser(user));
    }

    async logIn(email: string, password: string): Promise<ExportedUser> {
        try {
            let user = await userRepository.get(email);
            if (user instanceof User) {
                if (user.password === password) return Promise.resolve(this._exportUser(user));
                else return Promise.reject(new Error('LogIn information don\'t match.'))
            }

            let newUser = await userRepository.add(User.mapFromObject({ email, password, username: this._generateDefaultName(), score: 0 }));
            return this._exportUser(newUser);
        }
        catch (err) { return Promise.reject(err); }
    }

    async addScore(email: string, score: number): Promise<ExportedUser> {
        let user = await userRepository.get(email);
        if (!(user instanceof User)) return Promise.reject(new Error('Unable to retrieve the user'));

        try {
            user.score += score;
            let updatedUser = await userRepository.update(user);
            return this._exportUser(updatedUser);
        } catch (_) {
            return Promise.reject(new Error('An error occurred while update the user data.'));
        }
    }

    private _generateDefaultName() {
        const nameIdx = ToolKit.randomNumber(0, DEFAULT_NAME_COLLECTION.length - 1);
        return DEFAULT_NAME_COLLECTION[nameIdx] + ToolKit.randomNumber(0, 9) + ToolKit.randomNumber(0, 9);
    }

    private _exportUser(user: User): ExportedUser {
        let exportValue = new ExportedUser();
        exportValue.email = user.email;
        exportValue.username = user.username;
        exportValue.score = user.score;

        return exportValue;
    }
}

export let userService = new UserService();
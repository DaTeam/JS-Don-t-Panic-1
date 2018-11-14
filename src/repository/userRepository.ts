import { User } from '../models/user';
import { ToolKit } from '../toolkit';

class UserRepository {
    private userCollection: User[] = [];

    constructor() { }

    async get(email: string): Promise<User | null> {
        try {
            let user = await this._getUser(email);

            return this._cloneReturnUser(user);
        }
        catch (err) { return Promise.reject(err); }
    }

    async getByUsername(username: string): Promise<User | null> {
        let user = this.userCollection.find(userEntry => userEntry.username === username);
        if (!user) return null;

        return this._cloneReturnUser(user);
    }

    async getAll(): Promise<User[]> {
        try {
            return this.userCollection.map(user => this._safeCloneReturnUser(user));
        }
        catch (err) { return Promise.reject(err); }
    }

    async add(user: User): Promise<User> {
        try {
            let userEntry = await this._getUser(user.email);
            if (userEntry) return Promise.reject(new Error('A user with this email already exists.'));
        }
        catch (err) { return Promise.reject(err); }

        let newUser = User.mapFromObject(user);
        this.userCollection.push(newUser);
        return Promise.resolve(this._safeCloneReturnUser(newUser));
    }

    async update(user: User): Promise<User> {
        if (!(user instanceof User)) return Promise.reject(new Error('Unknown user.'));

        try {
            let { username, email, score } = user;
            try {
                let userEntry = await this._getUser(email);
                if (!userEntry) return Promise.reject(new Error('Unknown user.'));

                ToolKit.mapToDeepObject(userEntry, { username, score });

                return Promise.resolve(this._safeCloneReturnUser(userEntry));
            }
            catch (err) { return Promise.reject(err); }
        }
        catch (_) { return Promise.reject(new Error('An error occurred while updating the user.')); }
    }

    private async _getUser(email: string): Promise<User | null> {
        let foundEntry = this.userCollection.find(userEntry => userEntry.email === email);
        let returnValue: User | null;

        if (!foundEntry) returnValue = null;
        else returnValue = foundEntry;

        return Promise.resolve(returnValue);
    }

    private _cloneReturnUser(user: User | null): User | null {
        if (!(user instanceof User)) return null;

        return this._safeCloneReturnUser(user);
    }

    private _safeCloneReturnUser(user: User): User {
        return User.mapFromObject(user);
    }
}

export let userRepository = new UserRepository();
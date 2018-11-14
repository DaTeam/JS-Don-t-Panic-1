import * as express from 'express';
import { json, urlencoded } from 'body-parser';
import { join as joinPath, resolve as resolvePath } from 'path';
import * as morgan from 'morgan';
import { ToolKit } from './toolkit';
import { appConfig } from './appConfig';
import { router } from './router';
import { MAP_STORAGE_PATH } from './map/mapHelper';

export class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
        let settings = appConfig;
    }

    private config(): void {
        // support application/json type post data
        this.app.use(json());
        //support application/x-www-form-urlencoded post data
        this.app.use(urlencoded({ extended: false }));
        this.app.get('/', (req, res) => res.sendFile(joinPath(__dirname + '/index.html')));
        this.app.use('/', express.static(__dirname + '/public'));
        // Ugly, cannot find the reason why it doesn't work inside map Router
        this.app.use('/api/map/', express.static(resolvePath(ToolKit.cast<any>(global).__rootdir, MAP_STORAGE_PATH), { extensions: ['svg'], index: false }));
        // this.app.use('/api/map/', express.static(`${ToolKit.cast<any>(global).__rootdir}${MAP_STORAGE_PATH}`, { extensions: ['svg'], index: false }));
        this.app.use(router);

        // use morgan to log requests to the console
        this.app.use(morgan('dev'));
    }
}

export default new App().app;
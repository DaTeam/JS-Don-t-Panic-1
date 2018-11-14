import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { readFileSync } from 'fs';
import app from './app';
import { gameManager } from './gameManager';

interface ServerOptions {
    http: number;
    https: number;
}

export class Server {
    private httpPort: number;
    private httpsPort: number;

    constructor({ http, https }: ServerOptions) {
        this.httpPort = http;
        this.httpsPort = https;
    }

    startHttp() {
        createHttpServer(app).listen(this.httpPort, () => console.log(`Http server starts on port ${this.httpPort}`));
        return this;
    }

    startHttps() {
        createHttpsServer({
            key: readFileSync('server.key'),
            cert: readFileSync('server.cert'),
            requestCert: false,
            rejectUnauthorized: false
        }, app).listen(this.httpsPort, () => console.log(`Https server starts on port ${this.httpsPort}`));

        return this;
    }
}

new Server({ http: 8080, https: 8443 })
    .startHttp()
    .startHttps();

gameManager.start();
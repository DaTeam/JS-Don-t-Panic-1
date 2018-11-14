import * as express from 'express';
import { ToolKit } from '../../toolkit';
import { gameManager } from '../../gameManager';
import { checkJWToken } from '../security/jwtHelper';

export let mapRouter = express.Router();

mapRouter.get('/', checkJWToken, (req, res) => {
    res.json(gameManager.currentMap.export());
});

mapRouter.get('/check', checkJWToken, async (req: any, res) => {
    let { x, y } = req.query;
    let parsedX = parseInt(x, 10);
    let parsedY = parseInt(y, 10);

    if (ToolKit.isNaN(parsedX) || ToolKit.isNaN(parsedY)) {
        res.status(400).send('Invalid parameters')
        return;
    };

    try {
        res.json(await gameManager.check(req.authenticatedUser.email, parsedX, parsedY));
    }
    catch (e) {
        res.status(500).send(e.message);
    }
});
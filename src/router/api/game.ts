import { Router } from 'express';
import { gameManager } from '../../gameManager';
import { userService } from '../../service/userService';
import { checkJWToken } from '../security/jwtHelper';

export let gameRouter = Router();
gameRouter.get('/', checkJWToken, (req, res) => {
    res.json(gameManager.currentMap.export());
});

gameRouter.get('/players', async (req: any, res) => {
    let users = await userService.getAll();
    res.json(users);
});

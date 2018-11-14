import { Router } from 'express';
import { sign } from 'jsonwebtoken';
import { appConfig } from '../../appConfig';
import { userService } from '../../service/userService';
import { checkJWToken } from '../security/jwtHelper';

export let userRouter = Router();

userRouter.get('/', checkJWToken, async (req: any, res) => {
    let user = await userService.get(req.authenticatedUser.email);
    res.json(user);
});

userRouter.get('/:id', async (req, res) => {
    let user = await userService.get(req.params.email);
    res.json(user);
});

userRouter.post('/login', async (req, res) => {
    const userAuth = await userService.logIn(req.body.email, req.body.password);
    if (userAuth) {
        const token = sign({
            id: userAuth.email,
            username: userAuth.username
        }, appConfig.secretKey, {
                expiresIn: '2h'
            });

        return res.json({ token: token });
    }

    return res.status(401).send();
});
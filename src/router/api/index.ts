import { Router } from 'express';
import { userRouter } from './user';
import { mapRouter } from './map';
import { gameRouter } from './game';

export let apiRouter = Router();

apiRouter.use('/user', userRouter);
apiRouter.use('/map', mapRouter);
apiRouter.use('/game', gameRouter);

apiRouter.get('/', (req, res) => {
    res.json({
        name: 'Where is Marvin ?',
        version: '1.0',
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`
    });
});
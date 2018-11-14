import { Router } from 'express';
import { apiRouter } from './api';

export let router = Router();

router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

router.use('/api', apiRouter);

router.get('*', (req, res) => res.redirect('/'));
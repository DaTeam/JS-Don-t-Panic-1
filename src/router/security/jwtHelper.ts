import { verify } from 'jsonwebtoken';
import { appConfig } from '../../appConfig';
import { userService } from '../../service/userService';

export let checkJWToken = async (req: any, res: any, next: any) => {
    const token = req.headers['x-access-token'];
    if (token) {
        verify(token, appConfig.secretKey, async (err: any, decodedToken: any) => {
            if (err) return res.status(401).send({ error: 'Failed to authenticate token.' });

            try {
                let user = await userService.get(decodedToken.id);
                if (user) {
                    req.authenticatedUser = user;
                    return next();
                }
            } catch (_) { }
            return res.status(401).send({ error: 'User not found.' });
        });
    }
    
    else return res.status(401).send({ error: 'No token provided.' });
}
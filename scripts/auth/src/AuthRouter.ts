import {IBasicAuthedRequest} from 'express-basic-auth';
import {Request, Response} from 'express';
import {SignJWT, JWTPayload} from 'jose';
import {UserInterface} from './types';
import {getPrivateKey} from './Keys';
import UserRepository from './UserRepository';

export default async (userRepository: UserRepository, req: IBasicAuthedRequest | Request, res: Response) => {
    let user: UserInterface | undefined;
    if (('auth' in req) && (req.auth.user)) {
        user = userRepository.findByUsername(req.auth.user);
    }
    if (!user) {
        res.status(403).send();
        return;
    }

    const privateKey = await getPrivateKey();
    const payload: JWTPayload = {};
    if (user.scopes) {
        payload.scopes = user.scopes;
    }

    const jwt = await new SignJWT(payload)
        .setProtectedHeader({alg: 'ES256'})
        .setIssuedAt()
        .setIssuer('workshops@viniciuscampitelli.com')
        .setAudience(user.username)
        .setExpirationTime('2h')
        .sign(privateKey);

    res.send({
        status: true,
        access_token: jwt
    });
};

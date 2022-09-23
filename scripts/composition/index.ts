import {AppResponse, TypicodePost, TypicodeUser} from './types';
import axios, {AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse} from 'axios';
import express, {Request, Response} from 'express';
import {jwtVerify, JWTPayload, KeyLike, importSPKI} from 'jose';
import {readFileSync} from 'fs';

const morgan = require('morgan');

// Checando variável de ambiente
if (!(process.env.APP_URL_USERS || '').length) {
    throw new Error('Variável de ambiente não definida: APP_URL_USERS');
}
if (!(process.env.APP_URL_POSTS || '').length) {
    throw new Error('Variável de ambiente não definida: APP_URL_POSTS');
}
if (process.env.JWT_PUBLIC_KEY_PATH) {
    process.env.JWT_PUBLIC_KEY = readFileSync(process.env.JWT_PUBLIC_KEY_PATH, {encoding: 'utf-8'});
}
if (!(process.env.JWT_PUBLIC_KEY || '').length) {
    throw new Error('Variável de ambiente não definida: JWT_PUBLIC_KEY');
}

// Carregando chave pública e deixando o erro estourar no readFileSync / importSPKI
let publicKey: KeyLike | undefined;
/**
 * Returns the public key
 */
const getPublicKey = async (): Promise<KeyLike> => {
    if (!publicKey) {
        publicKey = await importSPKI(
            process.env.JWT_PUBLIC_KEY,
            'ES256'
        );
    }

    return publicKey;
}

/**
 * Valida o JWT
 *
 * @param {string} authorization
 * @returns {Promise<JWTPayload>}
 */
const validateAuthorization = async (authorization: string): Promise<JWTPayload> => {
    const [type, token] = authorization.split(' ', 2);

    if (type !== 'Bearer') {
        throw new Error();
    }

    const {payload} = await jwtVerify(token, await getPublicKey(), {
        issuer: 'workshops@viniciuscampitelli.com'
    });

    return payload;
}

const app = express();
app.use(morgan('combined'));

/**
 * Endpoint principal
 */
app.get('/', async (req: Request, res: Response) => {
    if (!req.headers.authorization) {
        res.sendStatus(401);
        return;
    }

    // Validando JWT
    let payload: JWTPayload | undefined;
    try {
        payload = await validateAuthorization(req.headers.authorization);
    } catch (err: any) {
    }

    // Verificando scopes do JWT
    if ((!payload) || (!payload.scopes) || (!Array.isArray(payload.scopes))) {
        res.sendStatus(401);
        return;
    }

    // Scopes básicos para esse endpoint
    if ((!payload.scopes.includes('posts')) || (!payload.scopes.includes('users'))) {
        res.sendStatus(403);
        return;
    }

    const headers: AxiosRequestHeaders = {
        authorization: req.headers.authorization,
    };
    if (req.headers['x-fail']) {
        headers['x-fail'] = 1;
    }
    if (req.headers['x-sleep-fail']) {
        headers['x-sleep-fail'] = 1;
    }
    const config: AxiosRequestConfig = {
        headers,
        validateStatus: () => true,
    };
    const promises: Promise<AxiosResponse>[] = [
        axios.get(process.env.APP_URL_POSTS, config),
        axios.get(process.env.APP_URL_USERS, config),
    ];

    try {
        // responses é um array de respostas dos endpoints chamados
        const responses: AxiosResponse[] = await Promise.all(promises);

        if ((!responses[0].data.status) || (!responses[0].data.data)) {
            throw new Error(responses[0].data.error || 'Um erro desconhecido ocorreu');
        }

        // Indexando usuários pelo ID para facilitar a composição
        const usersById: { [key: number]: TypicodeUser } = {};
        if ((responses[1]) && (responses[1].data.status) && (responses[1].data.data)) {
            responses[1].data.data.forEach((user: TypicodeUser) => {
                usersById[user.id] = user;
            });
        }
        delete responses[1];

        /**
         * Combinando usuário em cada objeto de posts.
         */
        const data: AppResponse[] = responses[0].data.data
            .map((post: TypicodePost) => ({...post, user: usersById[post.userId]}))
            .filter((row: AppResponse | null) => row !== null);

        res.send({
            status: true,
            composition: true,
            data: data
        });
    } catch (error: any) {
        const response = {
            status: false,
            error: error.message,
            externalError: undefined,
            url: undefined,
        };

        let code = 500;
        if (error.isAxiosError) {
            if (error.response) {
                code = error.response.status;
                if (error?.response?.data?.error) {
                    response.externalError = error.response.data.error;
                }
            }
            if (error.request) {
                response.url = error.request.path;
            }
            console.error(error);
        }

        res.status(code).send(response);
    }
});

app.listen(process.env.PORT || 3000);

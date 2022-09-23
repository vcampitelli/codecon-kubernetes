import express, {Request, Response} from 'express';
import basicAuth, {IBasicAuthedRequest} from 'express-basic-auth';
import AuthRouter from './src/AuthRouter';
import JWKSRouter from './src/JWKSRouter';
import {UserInterface} from './src/types';
import UserRepository from './src/UserRepository';

const app = express();

/**
 * Logs
 */
const morgan = require('morgan');
app.use(morgan('combined'));

/**
 * Endpoint para o JWKS
 */
app.get('/jwks.json', JWKSRouter);

/**
 * Autenticação
 */
const userRepository = new UserRepository();
const authUsers: { [key: string]: string } = {};
userRepository.findAll().map((user: UserInterface) => {
    authUsers[user.username] = user.password;
});
app.use(basicAuth({
    users: authUsers
}));

/**
 * Endpoint para retornar um token
 */
app.post('/auth', (req: IBasicAuthedRequest | Request, res: Response) => AuthRouter(userRepository, req, res));

app.listen(process.env.PORT || 3000);

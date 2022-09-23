const express = require('express');
const axios = require('axios');
const jose = require('jose');
const morgan = require('morgan');
const {readFileSync} = require('fs');

// Checando variável de ambiente
if (process.env.JWT_PUBLIC_KEY_PATH) {
    process.env.JWT_PUBLIC_KEY = readFileSync(process.env.JWT_PUBLIC_KEY_PATH, {encoding: 'utf-8'});
}
if (!(process.env.JWT_PUBLIC_KEY || '').length) {
    throw new Error('Variável de ambiente não definida: JWT_PUBLIC_KEY');
}

// Carregando chave pública e deixando o erro estourar no readFileSync / importSPKI
let publicKey;
(async function main() {
    publicKey = await jose.importSPKI(
        process.env.JWT_PUBLIC_KEY,
        'ES256'
    );
})();

/**
 * Valida o JWT
 *
 * @param {string} authorization
 * @returns {Promise<JWTPayload>}
 */
const validateAuthorization = async (authorization) => {
    const [type, token] = authorization.split(' ', 2);

    if (type !== 'Bearer') {
        throw new Error();
    }

    const {payload} = await jose.jwtVerify(token, publicKey, {
        issuer: 'workshops@viniciuscampitelli.com'
    });

    return payload;
}

const app = express();
app.use(morgan('combined'));

/**
 * Endpoint principal
 */
app.get('/users', async (req, res) => {
    if (req.headers['x-sleep-fail']) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        res.status(500)
            .send({
                status: false,
                error: 'Um timeout mais um erro foi encontrado'
            });
        return;
    }

    if (!req.headers.authorization) {
        res.sendStatus(401);
        return;
    }

    // Validando JWT
    let payload;
    try {
        payload = await validateAuthorization(req.headers.authorization);
    } catch (err) {
        console.error(err)
    }

    // Verificando scopes do JWT
    if ((!payload) || (!payload.scopes) || (!Array.isArray(payload.scopes))) {
        res.sendStatus(401);
        return;
    }

    // Scope básico para esse endpoint
    if (!payload.scopes.includes('users')) {
        res.sendStatus(403);
        return;
    }

    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/users');
        res.send({
            status: true,
            data: response.data
        });
    } catch (error) {
        res.status((error.isAxiosError && 'response' in error) ? error.response.status : 500)
            .send({
                status: false,
                error: error.message
            });
    }
});

app.listen(process.env.PORT || 3000);

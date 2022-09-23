import {importPKCS8, importSPKI, KeyLike} from 'jose';
import {readFileSync} from 'fs';

/**
 * Checando variáveis de ambiente
 */
let JWT_PRIVATE_KEY: string = process.env.JWT_PRIVATE_KEY || '';
if (process.env.JWT_PRIVATE_KEY_PATH) {
    JWT_PRIVATE_KEY = readFileSync(process.env.JWT_PRIVATE_KEY_PATH, {encoding: 'utf-8'});
}
if (!JWT_PRIVATE_KEY.length) {
    throw new Error('Variável de ambiente não definida: JWT_PRIVATE_KEY');
}
let JWT_PUBLIC_KEY: string = process.env.JWT_PUBLIC_KEY || '';
if (process.env.JWT_PUBLIC_KEY_PATH) {
    JWT_PUBLIC_KEY = readFileSync(process.env.JWT_PUBLIC_KEY_PATH, {encoding: 'utf-8'});
}
if (!JWT_PUBLIC_KEY.length) {
    throw new Error('Variável de ambiente não definida: JWT_PUBLIC_KEY');
}

let privateKey: KeyLike | undefined;

/**
 * Retorna a chave privada
 *
 * @returns {Promise<{type: KeyLike}>}
 */
export const getPrivateKey = async () => {
    if (!privateKey) {
        privateKey = await importPKCS8(
            JWT_PRIVATE_KEY,
            'ES256'
        );
    }

    return privateKey;
};

let publicKey: KeyLike | undefined;

/**
 * Retorna a chave pública
 *
 * @returns {Promise<{type: KeyLike}>}
 */
export const getPublicKey = async () => {
    if (!publicKey) {
        publicKey = await importSPKI(
            JWT_PUBLIC_KEY,
            'ES256'
        );
    }

    return publicKey;
};

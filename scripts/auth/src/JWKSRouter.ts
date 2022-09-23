import {exportJWK, JWK} from "jose";
import {IBasicAuthedRequest} from "express-basic-auth";
import {Request, Response} from "express";
import {getPublicKey} from "./Keys";

/**
 * Endpoint para o JWKS
 */
let jwk: JWK;
export default async (req: IBasicAuthedRequest | Request, res: Response) => {
    if (!jwk) {
        jwk = await exportJWK(await getPublicKey());
    }
    res.send({
        keys: [jwk]
    });
}

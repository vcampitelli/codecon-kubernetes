/**
 * @link https://stackoverflow.com/a/53981706
 */
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            PORT?: string;
            JWT_PRIVATE_KEY: string;
            JWT_PUBLIC_KEY: string;
            JWT_PRIVATE_KEY_PATH?: string;
            JWT_PUBLIC_KEY_PATH?: string;
        }
    }
}

export interface UserInterface {
    id: number;
    username: string;
    password: string;
    scopes: string[];
}

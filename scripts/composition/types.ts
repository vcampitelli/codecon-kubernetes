/**
 * Response for Typicode's Posts API
 */
export interface TypicodePost {
    id: number;
    userId: number;
    title: string;
    body: string;
}

/**
 * Response for Typicode's User API
 */
export interface TypicodeUser {
    id: number;
    name: string;
    username: string;
    email: string;
    website: string;
    address: {
        zipcode: string;
        geo: {
            lng: string;
            lat: string;
        };
        suite: string;
        city: string;
        street: string;
    };
    phone: string;
    company: {
        bs: string;
        catchPhrase: string;
        name: string;
    };
}

/**
 * Our API final response
 */
export type AppResponse = TypicodePost & { user: TypicodeUser };

/**
 * @link https://stackoverflow.com/a/53981706
 */
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            PORT?: string;
            APP_URL_POSTS: string;
            APP_URL_USERS: string;
            JWT_PUBLIC_KEY: string;
            JWT_PUBLIC_KEY_PATH?: string;
        }
    }
}

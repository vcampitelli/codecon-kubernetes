import {UserInterface} from './types';

class UserRepository {

    /**
     * Users database
     *
     * @type {UserInterface[]}
     */
    #data: UserInterface[] = [
        {
            id: 1,
            username: 'admin',
            password: 'admin',
            scopes: ['users', 'posts']
        },
        {
            id: 2,
            username: 'nousers',
            password: 'nousers',
            scopes: ['posts']
        },
    ];

    /**
     * @returns {UserInterface[]}
     */
    findAll(): UserInterface[] {
        return this.#data;
    }

    /**
     * @param {string} username
     * @returns {UserInterface|undefined}
     */
    findByUsername(username: string): UserInterface | undefined {
        return this.#data.find((user) => user.username === username) || undefined;
    }

}

export default UserRepository;

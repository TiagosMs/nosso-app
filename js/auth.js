import { Store } from './store.js';

export const Auth = {
    init() {
        Store.init();
    },

    login(username, password) {
        const users = Store.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            Store.setSession(username);
            return user;
        }
        throw new Error('Usuário ou senha inválidos.');
    },

    signup(username, password, partnerUsername) {
        Store.addUser({
            username,
            password,
            partner: partnerUsername // This links them by simple string reference as requested
        });
        Store.setSession(username);
    },

    logout() {
        Store.clearSession();
        window.location.reload();
    },

    getCurrentUser() {
        const username = Store.getSession();
        if (!username) return null;

        const users = Store.getUsers();
        return users.find(u => u.username === username);
    },

    getPartner() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return null;

        const users = Store.getUsers();
        return users.find(u => u.username === currentUser.partner);
    }
};

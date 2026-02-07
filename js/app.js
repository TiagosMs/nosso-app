import { Utils } from './utils.js';
import { Store } from './store.js';
import { Auth } from './auth.js';
// Import Views (Will create these next)
import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';

class App {
    constructor() {
        this.appEl = document.getElementById('app');
        this.init();
    }

    init() {
        Auth.init();
        this.checkAuth();
    }

    checkAuth() {
        const user = Auth.getCurrentUser();
        if (user) {
            this.renderDashboard(user);
        } else {
            this.renderLogin();
        }
    }

    renderLogin() {
        this.appEl.innerHTML = '';
        renderLogin(this.appEl, (user) => {
            // On success login/signup
            this.renderDashboard(user);
        });
    }

    renderDashboard(user) {
        this.appEl.innerHTML = '';
        renderDashboard(this.appEl, user, () => this.checkAuth()); // Pass logout callback/re-check
    }
}

// Start App
new App();

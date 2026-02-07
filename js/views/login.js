import { Auth } from '../auth.js';
import { Utils } from '../utils.js';

export function renderLogin(container, onLoginSuccess) {
    const el = Utils.createElement('div', 'auth-screen');

    el.innerHTML = `
        <div class="auth-logo">❤️ Nosso App</div>
        <div class="card">
            <h2 id="auth-title">Entrar</h2>
            
            <form id="auth-form">
                <div class="form-group">
                    <label class="form-label">Seu Nome de Usuário</label>
                    <input type="text" id="username" class="form-input" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Senha</label>
                    <input type="password" id="password" class="form-input" required>
                </div>

                <div id="signup-fields" class="hidden">
                    <div class="form-group">
                        <label class="form-label">Nome de Usuário da Pareira(o)</label>
                        <input type="text" id="partner" class="form-input" placeholder="Ex: maria123">
                    </div>
                </div>

                <button type="submit" class="btn btn-primary btn-full">Entrar</button>
            </form>
            
            <p style="margin-top: 1rem; font-size: 0.9rem;">
                <span id="toggle-text">É sua primeira vez?</span> 
                <a href="#" id="toggle-auth" style="color: var(--color-primary);">Criar conta</a>
            </p>
        </div>
    `;

    container.appendChild(el);

    // Logic
    const form = el.querySelector('#auth-form');
    const toggleBtn = el.querySelector('#toggle-auth');
    const signupFields = el.querySelector('#signup-fields');
    const authTitle = el.querySelector('#auth-title');
    const toggleText = el.querySelector('#toggle-text');
    const submitBtn = el.querySelector('button[type="submit"]');

    let isLogin = true;

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;

        if (isLogin) {
            authTitle.textContent = 'Entrar';
            submitBtn.textContent = 'Entrar';
            signupFields.classList.add('hidden');
            toggleText.textContent = 'É sua primeira vez?';
            toggleBtn.textContent = 'Criar conta';
            el.querySelector('#partner').removeAttribute('required');
        } else {
            authTitle.textContent = 'Criar Conta';
            submitBtn.textContent = 'Começar';
            signupFields.classList.remove('hidden');
            toggleText.textContent = 'Já tem conta?';
            toggleBtn.textContent = 'Entrar';
            el.querySelector('#partner').setAttribute('required', 'true');
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = el.querySelector('#username').value.trim();
        const password = el.querySelector('#password').value.trim();
        const partner = el.querySelector('#partner').value.trim();

        try {
            let user;
            if (isLogin) {
                user = Auth.login(username, password);
                Utils.showToast(`Bem-vindo de volta, ${user.username}!`);
            } else {
                Auth.signup(username, password, partner);
                user = Auth.login(username, password); // Auto login
                Utils.showToast('Conta criada com amor! ❤️');
            }
            onLoginSuccess(user);
        } catch (err) {
            Utils.showToast(err.message, 'error');
        }
    });
}

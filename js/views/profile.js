import { Utils } from '../utils.js';
import { Auth } from '../auth.js';
import { Store } from '../store.js';

export function renderProfile(container, currentUser) {
    const partner = Auth.getPartner();

    container.innerHTML = `
        <div class="card">
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="width: 80px; height: 80px; background: var(--color-primary-light); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 1rem;">
                    ${currentUser.username.charAt(0).toUpperCase()}
                </div>
                <h3>${currentUser.username}</h3>
                <p style="color: var(--color-text-muted);">Configurações</p>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 1.5rem;">
                <h4 style="margin-bottom: 1rem;">Status da Conexão</h4>
                
                ${partner ? `
                    <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 1rem; border-radius: var(--radius-sm); display: flex; align-items: center;">
                        <span style="font-size: 1.5rem; margin-right: 1rem;">💑</span>
                        <div>
                            <strong>Conectado com:</strong>
                            <div style="font-size: 1.1rem; color: var(--color-secondary);">${partner.username}</div>
                        </div>
                    </div>
                    <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 0.5rem; text-align: center;">Tudo certo! Vocês estão linkados.</p>
                ` : `
                    <div style="background: #fff5f5; border: 1px solid #fed7d7; padding: 1rem; border-radius: var(--radius-sm);">
                        <strong style="color: var(--color-danger);">Não conectado</strong>
                        <p style="margin-bottom: 1rem;">Você ainda não conectou com sua parceira(o).</p>
                        
                        <div class="form-group">
                            <label class="form-label">Nome de usuário dela(e):</label>
                            <div style="display: flex; gap: 0.5rem;">
                                <input type="text" id="partner-input" class="form-input" placeholder="Digite o username exato">
                                <button id="link-btn" class="btn btn-primary">Conectar</button>
                            </div>
                        </div>
                    </div>
                `}

            </div>
        </div>

        <div class="card">
            <h4>Sobre o App</h4>
            <p style="font-size: 0.9rem; color: var(--color-text-muted);">
                Versão 1.1<br>
                Feito com ❤️ apenas para vocês dois.
            </p>
            <button id="clear-data-btn" class="btn" style="margin-top: 1rem; width: 100%; border: 1px solid var(--color-danger); color: var(--color-danger); background: white;">
                ⚠️ Limpar tudo (Reset)
            </button>
        </div>
    `;

    // Logic for linking
    const linkBtn = container.querySelector('#link-btn');
    if (linkBtn) {
        linkBtn.addEventListener('click', () => {
            const input = container.querySelector('#partner-input');
            const partnerName = input.value.trim();

            if (partnerName === currentUser.username) {
                Utils.showToast('Você não pode conectar consigo mesmo.', 'error');
                return;
            }

            if (partnerName) {
                // Update user in store logic
                const allUsers = Store.getUsers();
                const myIdx = allUsers.findIndex(u => u.username === currentUser.username);

                if (myIdx !== -1) {
                    allUsers[myIdx].partner = partnerName;
                    Store.save({ ...Store.get(), users: allUsers });
                    Utils.showToast('Conexão atualizada! Recarregando...');
                    setTimeout(() => window.location.reload(), 1000);
                }
            }
        });
    }

    // Logic for Reset
    const resetBtn = container.querySelector('#clear-data-btn');
    resetBtn.addEventListener('click', () => {
        if (confirm('TEM CERTEZA? Isso apagará todas as fotos, metas e dados de ambos os usuários deste navegador. Não há como desfazer.')) {
            localStorage.clear();
            window.location.reload();
        }
    });
}

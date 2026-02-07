import { Store } from '../store.js';
import { Utils } from '../utils.js';
import { Auth } from '../auth.js';

export function renderMeals(container, currentUser) {
    const today = Utils.getTodayStr();
    const partner = Auth.getPartner();

    container.innerHTML = `
        <div class="card">
            <h3>Refeições de Hoje</h3>
            <div id="meals-form" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
                <label class="checkbox-card">
                    <input type="checkbox" name="breakfast">
                    <span class="label-text">☕ Café da Manhã</span>
                </label>
                <label class="checkbox-card">
                    <input type="checkbox" name="lunch">
                    <span class="label-text">🥗 Almoço</span>
                </label>
                <label class="checkbox-card">
                    <input type="checkbox" name="dinner">
                    <span class="label-text">🍲 Jantar</span>
                </label>
            </div>
        </div>

        ${partner ? `
        <div class="card">
            <h4>Refeições de ${partner.username}</h4>
            <div id="partner-meals" style="display: flex; gap: 1rem; justify-content: space-around; margin-top: 1rem; opacity: 0.7;">
                <!-- Generated via JS -->
            </div>
        </div>
        ` : ''}
    `;

    // Add some inline styles for big touch targets
    const style = document.createElement('style');
    style.textContent = `
        .checkbox-card {
            display: flex; 
            align-items: center; 
            padding: 1rem; 
            border: 1px solid #eee; 
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: background 0.2s;
        }
        .checkbox-card:active { background: #f9f9f9; }
        .checkbox-card input { margin-right: 1rem; transform: scale(1.5); }
        .label-text { font-size: 1.1rem; }
    `;
    container.appendChild(style);

    const inputs = container.querySelectorAll('#meals-form input');

    function updateUI() {
        const log = Store.getDailyLog(today, currentUser.username);

        inputs.forEach(input => {
            input.checked = log.meals[input.name];
        });

        if (partner) {
            const pLog = Store.getDailyLog(today, partner.username);
            const pContainer = container.querySelector('#partner-meals');

            const map = { breakfast: '☕', lunch: '🥗', dinner: '🍲' };
            pContainer.innerHTML = Object.keys(map).map(k => `
                <div style="text-align: center; ${pLog.meals[k] ? '' : 'filter: grayscale(100%); opacity: 0.3;'}">
                    <div style="font-size: 2rem;">${map[k]}</div>
                </div>
            `).join('');
        }
    }

    inputs.forEach(input => {
        input.addEventListener('change', () => {
            const log = Store.getDailyLog(today, currentUser.username);
            log.meals[input.name] = input.checked;

            Store.updateDailyLog(today, currentUser.username, { meals: log.meals });

            if (input.checked) Utils.showToast('Nham! Alimentado! 😋');
            updateUI();
        });
    });

    updateUI();
}

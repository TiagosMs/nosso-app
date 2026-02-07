import { Store } from '../store.js';
import { Utils } from '../utils.js';
import { Auth } from '../auth.js';

export function renderMood(container, currentUser) {
    const today = Utils.getTodayStr();
    const partner = Auth.getPartner();

    const moods = [
        { key: 'bem', icon: '😊', label: 'Bem' },
        { key: 'normal', icon: '😐', label: 'Normal' },
        { key: 'cansado', icon: '😔', label: 'Cansado' },
        { key: 'sobrecarregado', icon: '😣', label: 'Sobrecarregado' }
    ];

    container.innerHTML = `
        <div class="card" style="text-align: center;">
            <h3>Como você está hoje?</h3>
            <div id="mood-selector" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
                ${moods.map(m => `
                    <button class="mood-btn" data-key="${m.key}" style="
                        padding: 1rem; 
                        border: 2px solid transparent; 
                        border-radius: var(--radius-md); 
                        background: #f8f9fa;
                        font-size: 2rem;
                        display: flex; flex-direction: column; align-items: center; gap: 5px;
                    ">
                        <span>${m.icon}</span>
                        <span style="font-size: 0.9rem; font-weight: normal; color: var(--color-text-main);">${m.label}</span>
                    </button>
                `).join('')}
            </div>
        </div>

        ${partner ? `
        <div class="card" style="text-align: center;">
            <h3>Estado de ${partner.username}</h3>
             <div id="partner-mood" style="font-size: 4rem; margin-top: 1rem;">REQUEST_LOAD</div>
             <p id="partner-mood-label" style="color: var(--color-text-muted);">Ainda não registrou</p>
        </div>
        ` : ''}
    `;

    const buttons = container.querySelectorAll('.mood-btn');
    const partnerMoodDisplay = container.querySelector('#partner-mood');
    const partnerMoodLabel = container.querySelector('#partner-mood-label');

    function updateUI() {
        const log = Store.getDailyLog(today, currentUser.username);

        buttons.forEach(btn => {
            if (btn.dataset.key === log.mood) {
                btn.style.borderColor = 'var(--color-primary)';
                btn.style.background = '#fff5f0';
            } else {
                btn.style.borderColor = 'transparent';
                btn.style.background = '#f8f9fa';
            }
        });

        if (partner && partnerMoodDisplay) {
            const pLog = Store.getDailyLog(today, partner.username);
            if (pLog.mood) {
                const m = moods.find(x => x.key === pLog.mood);
                partnerMoodDisplay.textContent = m.icon;
                partnerMoodLabel.textContent = m.label;
            } else {
                partnerMoodDisplay.textContent = '❓';
                partnerMoodLabel.textContent = 'Ainda não registrou hoje';
            }
        }
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sadMoods = ['cansado', 'sobrecarregado'];
            const key = btn.dataset.key;

            Store.updateDailyLog(today, currentUser.username, { mood: key });

            // Logic for "Comforting message" for partner (handled in notification view ideally, but here we just toast self)
            if (sadMoods.includes(key)) {
                Utils.showToast('Tudo bem não estar 100%. ❤️', 'info');
            } else {
                Utils.showToast('Que bom! ✨');
            }

            updateUI();
        });
    });

    updateUI();
}

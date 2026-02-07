import { Store } from '../store.js';
import { Utils } from '../utils.js';
import { Auth } from '../auth.js';

export function renderWater(container, currentUser) {
    const today = Utils.getTodayStr();
    const partner = Auth.getPartner();

    container.innerHTML = `
        <div class="card" style="text-align: center;">
            <h3>Hidratação</h3>
            <p style="color: var(--color-text-muted); font-size: 0.9rem;">Meta diária: 2000ml</p>
            
            <div style="margin: 2rem 0; position: relative; height: 30px; background: #eee; border-radius: 15px; overflow: hidden;">
                <div id="water-bar" style="width: 0%; height: 100%; background: var(--color-water); transition: width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></div>
                <span id="water-text" style="position: absolute; width: 100%; top: 50%; transform: translateY(-50%); color: #333; font-weight: bold; font-size: 0.8rem;">0ml</span>
            </div>

            <button id="add-water-btn" class="btn btn-primary" style="background: var(--color-water);">+ Beber 500ml 💧</button>
        </div>

        ${partner ? `
        <div class="card" style="opacity: 0.8;">
            <h4>Água de ${partner.username}</h4>
            <div style="margin-top: 1rem; height: 10px; background: #eee; border-radius: 5px; overflow: hidden;">
                <div id="partner-water-bar" style="width: 0%; height: 100%; background: var(--color-water);"></div>
            </div>
            <p id="partner-water-text" style="font-size: 0.8rem; text-align: center; margin-top: 5px;">0ml</p>
        </div>
        ` : ''}
    `;

    const btn = container.querySelector('#add-water-btn');
    const bar = container.querySelector('#water-bar');
    const text = container.querySelector('#water-text');

    function updateUI() {
        const log = Store.getDailyLog(today, currentUser.username);
        const percent = Math.min((log.water / 2000) * 100, 100);

        bar.style.width = percent + '%';
        text.textContent = `${log.water}ml`;

        if (log.water >= 2000) {
            bar.style.backgroundColor = 'var(--color-success)';
        }

        // Partner
        if (partner) {
            const partnerLog = Store.getDailyLog(today, partner.username);
            const partnerPercent = Math.min((partnerLog.water / 2000) * 100, 100);
            container.querySelector('#partner-water-bar').style.width = partnerPercent + '%';
            container.querySelector('#partner-water-text').textContent = `${partnerLog.water}ml`;
        }
    }

    btn.addEventListener('click', () => {
        const log = Store.getDailyLog(today, currentUser.username);
        const oldWater = log.water;
        const newWater = oldWater + 500;

        Store.updateDailyLog(today, currentUser.username, { water: newWater });

        Utils.showToast('+500ml Hidratado! 💧');

        if (oldWater < 2000 && newWater >= 2000) {
            Utils.showToast('Parabéns! Meta de água atingida! 🌊🏆');
        }

        updateUI();
    });

    updateUI();
}

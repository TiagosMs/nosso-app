import { Store } from '../store.js';
import { Utils } from '../utils.js';
import { Auth } from '../auth.js';

export function renderGoals(container, currentUser) {
    const today = Utils.getTodayStr();
    const partner = Auth.getPartner();

    container.innerHTML = `
        <div class="card">
            <h3>Minhas Metas Diárias</h3>
            <div id="my-goals-list"></div>
            <div style="margin-top: 1rem;">
                <input type="text" id="new-goal-input" class="form-input" placeholder="Nova meta..." style="margin-bottom: 0.5rem;">
                <button id="add-goal-btn" class="btn btn-primary btn-full">Adicionar</button>
            </div>
        </div>

        <div class="card">
            <h3>Metas do Casal</h3>
            <div id="couple-goals-list"></div>
            <button id="add-couple-goal-btn" class="btn btn-full" style="margin-top: 0.5rem; border: 1px dashed var(--color-primary); color: var(--color-primary);">+ Nova Meta Juntos</button>
        </div>

        ${partner ? `
        <div class="card" style="border: 1px solid var(--color-secondary);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="color: var(--color-secondary); margin: 0;">Metas de ${partner.username}</h3>
                <span id="partner-progress-text" style="font-weight: bold; color: var(--color-secondary);">0%</span>
            </div>
            
            <div style="height: 6px; background: rgba(0,0,0,0.05); border-radius: 3px; margin-bottom: 1rem; overflow: hidden;">
                <div id="partner-progress-bar" style="height: 100%; width: 0%; background: var(--color-secondary); transition: width 0.3s;"></div>
            </div>

            <div id="partner-goals-list"></div>
        </div>
        ` : ''}
    `;

    // --- My Goals Logic ---
    const myGoalsList = container.querySelector('#my-goals-list');
    const newGoalInput = container.querySelector('#new-goal-input');
    const addGoalBtn = container.querySelector('#add-goal-btn');

    function renderMyGoals() {
        const log = Store.getDailyLog(today, currentUser.username);
        myGoalsList.innerHTML = '';

        // Add Default "Fixed" metas if not present on creation (handled in store usually, but let's check)
        // Store.getDailyLog creates empty goals array.

        log.goals.forEach((goal, idx) => {
            const item = Utils.createElement('div', 'goal-item');
            item.style.cssText = `display: flex; align-items: center; padding: 0.8rem 0; border-bottom: 1px solid rgba(0,0,0,0.05);`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = goal.done;
            checkbox.style.marginRight = '12px';
            checkbox.style.transform = 'scale(1.2)';

            checkbox.addEventListener('change', () => {
                log.goals[idx].done = checkbox.checked;
                Store.updateDailyLog(today, currentUser.username, { goals: log.goals });
                if (checkbox.checked) Utils.showToast('Boa! Meta concluída! 🎉');
            });

            const text = document.createElement('span');
            text.textContent = goal.text;
            if (goal.done) text.style.textDecoration = 'line-through';
            if (goal.done) text.style.opacity = '0.6';

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.innerHTML = '&times;';
            delBtn.style.cssText = 'margin-left: auto; color: var(--color-danger); font-size: 1.5rem; background: none; opacity: 0.5; padding: 0 0.5rem;';
            delBtn.addEventListener('click', () => {
                log.goals.splice(idx, 1);
                Store.updateDailyLog(today, currentUser.username, { goals: log.goals });
                renderMyGoals();
            });

            item.appendChild(checkbox);
            item.appendChild(text);
            item.appendChild(delBtn);
            myGoalsList.appendChild(item);
        });
    }

    addGoalBtn.addEventListener('click', () => {
        const text = newGoalInput.value.trim();
        if (!text) return;

        const log = Store.getDailyLog(today, currentUser.username);
        log.goals.push({ id: Utils.uuid(), text, done: false, type: 'personal' });
        Store.updateDailyLog(today, currentUser.username, { goals: log.goals });

        newGoalInput.value = '';
        renderMyGoals();
    });

    // --- Partner Goals Logic (Read Only) ---
    function renderPartnerGoals() {
        if (!partner) return;
        const partnerContainer = container.querySelector('#partner-goals-list');
        const progressBar = container.querySelector('#partner-progress-bar');
        const progressText = container.querySelector('#partner-progress-text');

        const log = Store.getDailyLog(today, partner.username);

        partnerContainer.innerHTML = '';
        if (log.goals.length === 0) {
            partnerContainer.innerHTML = '<small style="color: var(--text-muted); display: block; text-align: center; padding: 1rem;">Nenhuma meta definida hoje.</small>';
            progressBar.style.width = '0%';
            progressText.textContent = '0%';
            return;
        }

        let completedCount = 0;

        log.goals.forEach(goal => {
            if (goal.done) completedCount++;

            const item = document.createElement('div');
            item.style.padding = '0.6rem 0';
            item.style.borderBottom = '1px solid rgba(0,0,0,0.03)';
            item.style.display = 'flex';
            item.style.alignItems = 'center';

            item.innerHTML = `
                <span style="font-size: 1.2rem; margin-right: 10px;">${goal.done ? '✅' : '⏳'}</span>
                <span style="${goal.done ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${goal.text}</span>
            `;
            partnerContainer.appendChild(item);
        });

        // Update Progress
        const percent = Math.round((completedCount / log.goals.length) * 100);
        progressBar.style.width = percent + '%';
        progressText.textContent = percent + '%';
    }

    // --- Couple Goals Logic ---
    const coupleGoalsList = container.querySelector('#couple-goals-list');
    const addCoupleGoalBtn = container.querySelector('#add-couple-goal-btn');

    function renderCoupleGoals() {
        const goals = Store.getCoupleGoals();
        coupleGoalsList.innerHTML = '';

        goals.forEach(goal => {
            const item = document.createElement('div');
            item.style.cssText = `display: flex; align-items: center; padding: 0.5rem 0;`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = goal.done;
            checkbox.style.marginRight = '10px';

            checkbox.addEventListener('change', () => {
                Store.updateCoupleGoal(goal.id, { done: checkbox.checked });
                if (checkbox.checked) Utils.showToast('Uhuul! Conquista desbloqueada! 💑');
                renderCoupleGoals();
            });

            const text = document.createElement('span');
            text.textContent = goal.text;
            if (goal.done) {
                text.style.textDecoration = 'line-through';
                text.style.color = 'var(--color-success)';
            }

            item.appendChild(checkbox);
            item.appendChild(text);
            coupleGoalsList.appendChild(item);
        });

        if (goals.length === 0) {
            coupleGoalsList.innerHTML = '<small>O que querem fazer juntos?</small>';
        }
    }

    addCoupleGoalBtn.addEventListener('click', () => {
        const text = prompt('Meta de casal:');
        if (text) {
            Store.addCoupleGoal({ id: Utils.uuid(), text, done: false });
            renderCoupleGoals();
        }
    });

    // Init
    renderMyGoals();
    renderPartnerGoals();
    renderCoupleGoals();
}

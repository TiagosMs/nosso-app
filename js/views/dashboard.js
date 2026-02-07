import { Auth } from '../auth.js';
import { Utils } from '../utils.js';

// Sub-views
import { renderPhotos } from './photos.js';
import { renderGoals } from './goals.js';
import { renderWater } from './water.js';
import { renderMeals } from './meals.js';
import { renderMood } from './mood.js';
import { renderProfile } from './profile.js';
import { renderChat } from './chat.js';

export function renderDashboard(container, currentUser, onLogout) {
    // Layout Shell
    container.innerHTML = `
        <div id="content-area" style="padding-bottom: 80px;"></div>
        <nav class="nav-bar">
            <div class="nav-item active" data-tab="photos">
                <span class="nav-icon">🖼️</span>
                <span>Mural</span>
            </div>
            <div class="nav-item" data-tab="goals">
                <span class="nav-icon">✅</span>
                <span>Metas</span>
            </div>
            <div class="nav-item" data-tab="chat">
                <span class="nav-icon">💬</span>
                <span>Chat</span>
            </div>
            <div class="nav-item" data-tab="water">
                <span class="nav-icon">💧</span>
                <span>Água</span>
            </div>
            <div class="nav-item" data-tab="meals">
                <span class="nav-icon">🍽️</span>
                <span>Comer</span>
            </div>
            <div class="nav-item" data-tab="mood">
                <span class="nav-icon">😊</span>
                <span>Estado</span>
            </div>
            <div class="nav-item" data-tab="profile">
                <span class="nav-icon">⚙️</span>
                <span>Perfil</span>
            </div>
            <div class="nav-item" id="logout-btn">
                <span class="nav-icon">🚪</span>
                <span>Sair</span>
            </div>
        </nav>
    `;

    const contentArea = container.querySelector('#content-area');
    const navItems = container.querySelectorAll('.nav-item[data-tab]');
    const logoutBtn = container.querySelector('#logout-btn');

    // Tab Logic
    function switchTab(tabName) {
        // Update Nav
        navItems.forEach(item => item.classList.remove('active'));
        const activeItem = container.querySelector(`.nav-item[data-tab="${tabName}"]`);
        if (activeItem) activeItem.classList.add('active');

        // Clear Content
        contentArea.innerHTML = '';
        window.scrollTo(0, 0);

        // Render View
        switch (tabName) {
            case 'photos': renderPhotos(contentArea, currentUser); break;
            case 'goals': renderGoals(contentArea, currentUser); break;
            case 'water': renderWater(contentArea, currentUser); break;
            case 'meals': renderMeals(contentArea, currentUser); break;
            case 'mood': renderMood(contentArea, currentUser); break;
            case 'profile': renderProfile(contentArea, currentUser); break;
            case 'chat': renderChat(contentArea, currentUser); break;
        }
    }



    // Event Listeners
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });

    logoutBtn.addEventListener('click', () => {
        if (confirm('Sair do app?')) {
            Auth.logout();
            onLogout(); // Should trigger re-render of login
        }
    });

    // Default Tab
    switchTab('photos');
}

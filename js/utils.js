export const Utils = {
    // Generate simple unique ID
    uuid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Format date for display
    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    },

    // Get today's date string YYYY-MM-DD
    getTodayStr() {
        return new Date().toISOString().split('T')[0];
    },

    // Show Toast Notification
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');

        let color = 'var(--color-text-main)';
        let bg = 'var(--color-bg-card)';
        let border = 'none';

        if (type === 'success') {
            color = 'white';
            bg = 'var(--color-success)';
        } else if (type === 'error') {
            color = 'white';
            bg = 'var(--color-danger)';
        } else if (type === 'info') {
            color = 'var(--color-text-main)';
            bg = '#fff3cd'; // Light yellow
        }

        toast.style.cssText = `
            background: ${bg};
            color: ${color};
            padding: 1rem;
            border-radius: var(--radius-sm);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            text-align: center;
        `;

        toast.textContent = message;
        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        // Remove after 3s
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // DOM Helper to create elements easily
    createElement(tag, className, text = '') {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text) el.textContent = text;
        return el;
    }
};

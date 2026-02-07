import { Store } from '../store.js';
import { Utils } from '../utils.js';
import { Auth } from '../auth.js';

export function renderChat(container, currentUser) {
    const partner = Auth.getPartner();

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; height: calc(100vh - 140px);">
            <div class="card" style="padding: 1rem; margin-bottom: 0.5rem; text-align: center; flex-shrink: 0;">
                <h3>Conversa</h3>
                ${partner ? `<p style="font-size: 0.8rem; color: var(--color-text-muted);">Com ${partner.username}</p>` : ''}
            </div>

            ${!partner ? `
                <div style="text-align: center; padding: 2rem;">
                    <p>Conecte-se com sua parceira(o) na aba Perfil para usar o chat.</p>
                </div>
            ` : `
                <div id="chat-messages" style="
                    flex: 1; 
                    overflow-y: auto; 
                    padding: 1rem; 
                    background: #fdfdfd; 
                    border-radius: var(--radius-md);
                    margin-bottom: 0.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                "></div>

                <form id="chat-form" style="display: flex; gap: 0.5rem;">
                    <input type="text" id="chat-input" class="form-input" placeholder="Digite uma mensagem..." autocomplete="off">
                    <button type="submit" class="btn btn-primary">➤</button>
                </form>
            `}
        </div>
    `;

    if (!partner) return;

    const messagesContainer = container.querySelector('#chat-messages');
    const form = container.querySelector('#chat-form');
    const input = container.querySelector('#chat-input');

    // Auto-scroll logic
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function renderMessages() {
        const messages = Store.getMessages(partner.username, currentUser.username);

        // Simple optimization: only render if count changed (basic) or just re-render all for prototype
        messagesContainer.innerHTML = messages.map(msg => {
            const isMe = msg.from === currentUser.username;
            return `
                <div style="
                    align-self: ${isMe ? 'flex-end' : 'flex-start'};
                    max-width: 70%;
                    background: ${isMe ? 'var(--color-primary)' : '#e0e0e0'};
                    color: ${isMe ? 'white' : 'var(--color-text-main)'};
                    padding: 0.6rem 1rem;
                    border-radius: 1rem;
                    border-bottom-${isMe ? 'right' : 'left'}-radius: 0;
                    font-size: 0.95rem;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                ">
                    ${msg.text}
                    <div style="
                        font-size: 0.65rem; 
                        text-align: right; 
                        opacity: 0.7; 
                        margin-top: 4px;
                    ">
                        ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            `;
        }).join('');

        scrollToBottom();
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        const newMsg = {
            id: Utils.uuid(),
            from: currentUser.username,
            to: partner.username,
            text: text,
            timestamp: new Date().toISOString()
        };

        Store.addMessage(newMsg);
        input.value = '';
        renderMessages();
    });

    renderMessages();

    // Poll for new messages (simulate realtime since localStorage events work across tabs usually, but let's poll for single-page feel too)
    const interval = setInterval(() => {
        if (document.body.contains(messagesContainer)) {
            renderMessages();
        } else {
            clearInterval(interval);
        }
    }, 2000);
}

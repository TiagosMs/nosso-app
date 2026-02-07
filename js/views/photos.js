import { Store } from '../store.js';
import { Utils } from '../utils.js';

export function renderPhotos(container, currentUser) {
    container.innerHTML = `
        <h2 style="margin-bottom: 1rem;">Mural de Momentos</h2>
        <div id="photo-wall" class="photo-wall"></div>
        <div class="fab" id="add-photo-btn">+</div>
        <input type="file" id="file-input" accept="image/*" style="display: none;">
    `;

    const wall = container.querySelector('#photo-wall');
    const addBtn = container.querySelector('#add-photo-btn');
    const fileInput = container.querySelector('#file-input');

    function loadPhotos() {
        wall.innerHTML = '';
        const photos = Store.getPhotos();

        // Safety check for invalid photos
        const validPhotos = photos.filter(p => p && p.url);

        validPhotos.forEach(photo => {
            if (photo.private && photo.author !== currentUser.username) return;

            const card = document.createElement('div');
            card.className = 'photo-card';

            const hasReacted = photo.reactions ? photo.reactions.includes(currentUser.username) : false;
            const reactionBtnClass = hasReacted ? 'reaction-active' : '';
            const reactionsCount = photo.reactions ? photo.reactions.length : 0;

            card.innerHTML = `
                <img src="${photo.url}" class="photo-img" loading="lazy" style="min-height: 100px; background: #eee;">
                <div class="photo-meta">
                    <div class="photo-caption">
                        ${photo.private ? '🔒' : ''} <strong>${photo.author}</strong>: ${photo.caption}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                        <span class="photo-date">${Utils.formatDate(photo.date)}</span>
                        <button class="btn-reaction ${reactionBtnClass}" data-id="${photo.id}" style="background:none; border:none; cursor:pointer;" title="Amei">
                            ${hasReacted ? '❤️' : '🤍'} <span style="font-size: 0.8rem; color: var(--color-text-muted);">${reactionsCount}</span>
                        </button>
                    </div>
                </div>
            `;

            const reactBtn = card.querySelector('.btn-reaction');
            reactBtn.addEventListener('click', () => {
                const updatedPhotos = Store.getPhotos();
                const target = updatedPhotos.find(p => p.id === photo.id);
                if (target) {
                    if (!target.reactions) target.reactions = []; // migrating old data if needed

                    if (target.reactions.includes(currentUser.username)) {
                        target.reactions = target.reactions.filter(u => u !== currentUser.username);
                    } else {
                        target.reactions.push(currentUser.username);
                    }
                    Store.save({ ...Store.get(), photos: updatedPhotos });
                    loadPhotos();
                }
            });

            wall.appendChild(card);
        });

        if (wall.children.length === 0) {
            wall.innerHTML = '<p style="text-align:center; color: var(--color-text-muted); grid-column: 1/-1;">Nenhuma foto ainda. Adicione a primeira! 📸</p>';
        }
    }

    addBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Resize process
        Utils.showToast('Processando imagem...', 'info');

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Canvas resize
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600; // Limit size heavily for localStorage
                const scaleSize = MAX_WIDTH / img.width;
                const width = MAX_WIDTH;
                const height = img.height * scaleSize;

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Get Base64
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality

                // Check size (approximate)
                if (dataUrl.length > 2000000) { // > 2MB check
                    Utils.showToast('Imagem muito grande para armazenamento local.', 'error');
                    return;
                }

                const caption = prompt('Legenda (Opcional):') || '';
                const isPrivate = confirm('Marcar como privada? (Só você vê)');

                const newPhoto = {
                    id: Utils.uuid(),
                    url: dataUrl,
                    caption: caption.substring(0, 100),
                    date: new Date().toISOString(),
                    author: currentUser.username,
                    private: isPrivate,
                    reactions: []
                };

                try {
                    Store.addPhoto(newPhoto);
                    Utils.showToast('Foto adicionada! 📸');
                    loadPhotos();
                } catch (err) {
                    Utils.showToast('Erro: Memória cheia. Delete algumas fotos antigas.', 'error');
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);

        // Reset input so same file can be selected again if needed
        fileInput.value = '';
    });

    loadPhotos();
}

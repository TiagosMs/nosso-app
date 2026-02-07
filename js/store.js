const DB_KEY = 'nosso_app_db_v1';
const DB_USER_KEY = 'nosso_app_current_user';

export const Store = {
    // Initialize DB if empty
    init() {
        if (!localStorage.getItem(DB_KEY)) {
            const initialData = {
                users: [],      // { username, password, partner }
                photos: [],     // { id, url, caption, date, author, private, reactions: [] }
                daily_logs: [], // { date, username, water, meals: {}, mood, goals: [] }
                couple_goals: []// { id, text, done, completedBy }
            };
            this.save(initialData);
        }
    },

    get() {
        return JSON.parse(localStorage.getItem(DB_KEY));
    },

    save(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    },

    // --- User Management ---
    getUsers() {
        return this.get().users;
    },

    addUser(user) {
        const data = this.get();
        // Check if max users reached (2)
        if (data.users.length >= 2) throw new Error('Limite de 2 usuários atingido.');
        if (data.users.find(u => u.username === user.username)) throw new Error('Usuário já existe.');

        data.users.push(user);
        this.save(data);
    },

    getSession() {
        return localStorage.getItem(DB_USER_KEY);
    },

    setSession(username) {
        localStorage.setItem(DB_USER_KEY, username);
    },

    clearSession() {
        localStorage.removeItem(DB_USER_KEY);
    },

    // --- Data Access ---

    // Generic Helper to get daily log or create if missing
    getDailyLog(date, username) {
        const data = this.get();
        let log = data.daily_logs.find(l => l.date === date && l.username === username);

        if (!log) {
            log = {
                date,
                username,
                water: 0,
                meals: { breakfast: false, lunch: false, dinner: false },
                mood: null,
                goals: []
            };
            data.daily_logs.push(log);
            this.save(data);
        }
        return log;
    },

    updateDailyLog(date, username, updates) {
        const data = this.get();
        const index = data.daily_logs.findIndex(l => l.date === date && l.username === username);

        if (index === -1) {
            // Should create first via getDailyLog, but handle here mainly for robustness
            const newLog = {
                date,
                username,
                water: 0,
                meals: { breakfast: false, lunch: false, dinner: false },
                mood: null,
                goals: [],
                ...updates
            };
            data.daily_logs.push(newLog);
        } else {
            data.daily_logs[index] = { ...data.daily_logs[index], ...updates };
        }
        this.save(data);
    },

    // Photos
    getPhotos() {
        return this.get().photos;
    },

    addPhoto(photo) {
        const data = this.get();
        data.photos.unshift(photo); // Add to top
        this.save(data);
    },

    // Couple Goals
    getCoupleGoals() {
        return this.get().couple_goals;
    },

    addCoupleGoal(goal) {
        const data = this.get();
        data.couple_goals.push(goal);
        this.save(data);
    },

    updateCoupleGoal(id, updates) {
        const data = this.get();
        const idx = data.couple_goals.findIndex(g => g.id === id);
        if (idx !== -1) {
            data.couple_goals[idx] = { ...data.couple_goals[idx], ...updates };
            this.save(data);
        }
    },

    // --- Chat ---
    getMessages(partnerUsername, currentUser) {
        const data = this.get();
        if (!data.messages) return [];
        // Filter messages between these two users
        return data.messages.filter(m =>
            (m.from === currentUser && m.to === partnerUsername) ||
            (m.from === partnerUsername && m.to === currentUser)
        );
    },

    addMessage(msg) {
        const data = this.get();
        if (!data.messages) data.messages = [];
        data.messages.push(msg);
        this.save(data);
    }
};


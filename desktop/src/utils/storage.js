class StorageService {
    constructor() {
        this.prefix = 'reelflow_';
    }

    get(key) {
        const value = localStorage.getItem(this.prefix + key);
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    set(key, value) {
        const toStore = typeof value === 'object' ? JSON.stringify(value) : value;
        localStorage.setItem(this.prefix + key, toStore);
    }

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }

    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
    }

    getToken() {
        return this.get('token');
    }

    setToken(token) {
        this.set('token', token);
    }

    getUser() {
        return this.get('user');
    }

    setUser(user) {
        this.set('user', user);
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    logout() {
        this.remove('token');
        this.remove('user');
    }
}

export default new StorageService();

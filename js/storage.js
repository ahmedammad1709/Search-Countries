const STORAGE_KEYS = {
    FAVORITES: 'countryApp_favorites',
    HISTORY: 'countryApp_history',
    THEME: 'countryApp_theme'
};

const MAX_HISTORY = 10;

export const Storage = {
    getFavorites: () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
    },

    addFavorite: (country) => {
        const favorites = Storage.getFavorites();
        if (!favorites.some(f => f.cca3 === country.cca3)) {
            // Store minimal data
            const minimal = {
                name: country.name.common,
                cca3: country.cca3,
                flag: country.flags.svg
            };
            favorites.push(minimal);
            localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
            return true;
        }
        return false;
    },

    removeFavorite: (cca3) => {
        const favorites = Storage.getFavorites().filter(f => f.cca3 !== cca3);
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    },

    isFavorite: (cca3) => {
        return Storage.getFavorites().some(f => f.cca3 === cca3);
    },

    getHistory: () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    },

    addToHistory: (country) => {
        let history = Storage.getHistory();
        // Remove if exists to move to top
        history = history.filter(h => h.cca3 !== country.cca3);
        
        const minimal = {
            name: country.name.common,
            cca3: country.cca3,
            flag: country.flags.svg
        };
        
        history.unshift(minimal);
        if (history.length > MAX_HISTORY) history.pop();
        
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    },

    getTheme: () => {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    },

    setTheme: (theme) => {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
};
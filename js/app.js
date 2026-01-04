import { API } from './api.js';
import { UI } from './ui.js';
import { Search } from './search.js';
import { MapView } from './map.js';
import { Storage } from './storage.js';

let currentMode = 'explore';
let currentCountry = null;
let comparison = { c1: null, c2: null };

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Theme
    const theme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.querySelector('#theme-toggle i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';

    // Event Listeners
    setupNavigation();
    setupSearch();
    setupThemeToggle();
    
    // Check URL params for deep linking (optional) or load last viewed
    const history = Storage.getHistory();
    if (history.length > 0) {
        loadCountry(history[0].cca3);
    }
});

const setupThemeToggle = () => {
    document.getElementById('theme-toggle').addEventListener('click', UI.toggleTheme);
};

const setupNavigation = () => {
    const navBtn = document.getElementById('nav-mode-btn');
    const dropdown = document.getElementById('nav-dropdown');
    const items = document.querySelectorAll('.nav-item');
    const text = document.getElementById('current-mode-text');

    navBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
        navBtn.setAttribute('aria-expanded', !dropdown.classList.contains('hidden'));
    });

    document.addEventListener('click', () => {
        dropdown.classList.add('hidden');
        navBtn.setAttribute('aria-expanded', 'false');
    });

    items.forEach(item => {
        item.addEventListener('click', () => {
            const mode = item.dataset.mode;
            currentMode = mode;
            
            // Update UI Active State
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            text.innerHTML = item.innerHTML; // Update dropdown text
            
            // Switch View
            switchView(mode);
        });
    });
};

const switchView = (mode) => {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById('search-section').classList.add('hidden');

    if (mode === 'explore') {
        document.getElementById('explore-view').classList.remove('hidden');
        document.getElementById('search-section').classList.remove('hidden');
    } else if (mode === 'compare') {
        document.getElementById('compare-view').classList.remove('hidden');
        setupCompareSearch();
    } else if (mode === 'map') {
        document.getElementById('map-view').classList.remove('hidden');
        document.getElementById('search-section').classList.remove('hidden');
        MapView.refresh();
        if (currentCountry) MapView.focusCountry(currentCountry);
    } else if (mode === 'favorites') {
        document.getElementById('list-view').classList.remove('hidden');
        UI.renderList(Storage.getFavorites(), 'Your Favorites', loadCountryFromList, (code) => Storage.removeFavorite(code));
    } else if (mode === 'history') {
        document.getElementById('list-view').classList.remove('hidden');
        UI.renderList(Storage.getHistory(), 'Recently Viewed', loadCountryFromList);
    }
};

const loadCountryFromList = (code) => {
    // Switch to explore mode and load
    document.querySelector('[data-mode="explore"]').click();
    loadCountry(code);
};

const setupSearch = () => {
    Search.init('country-input', 'search-suggestions', loadCountry);
    
    // Listen for custom event from neighbor clicks
    window.addEventListener('country-select', (e) => {
        loadCountry(e.detail);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

const loadCountry = async (code) => {
    try {
        UI.setLoading(true);
        const country = await API.fetchByCode(code);
        currentCountry = country;

        // Fetch neighbors
        const neighbors = country.borders ? await API.fetchByCodes(country.borders) : [];

        // Render UI
        UI.renderCountry(country, neighbors);
        
        // Update Map if active
        if (currentMode === 'map') {
            MapView.focusCountry(country, neighbors);
        }

        // Add to history
        Storage.addToHistory(country);

        UI.setLoading(false);
    } catch (error) {
        UI.showError('Failed to load country data. Please try again.');
        console.error(error);
    }
};

const setupCompareSearch = () => {
    // Ensure we don't re-init if already done
    if (document.getElementById('compare-input-1').dataset.init) return;

    const onSelect1 = async (code) => {
        comparison.c1 = await API.fetchByCode(code);
        checkComparison();
    };

    const onSelect2 = async (code) => {
        comparison.c2 = await API.fetchByCode(code);
        checkComparison();
    };

    Search.init('compare-input-1', 'compare-suggestions-1', onSelect1);
    Search.init('compare-input-2', 'compare-suggestions-2', onSelect2);
    
    document.getElementById('compare-input-1').dataset.init = 'true';
};

const checkComparison = () => {
    if (comparison.c1 && comparison.c2) {
        UI.renderComparison(comparison.c1, comparison.c2);
    }
};
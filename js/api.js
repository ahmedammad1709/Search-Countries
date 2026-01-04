import { normalizeName } from './utils.js';

const BASE_URL = 'https://restcountries.com/v3.1';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const cache = new Map();

const getCached = (key) => {
    if (cache.has(key)) {
        const { data, timestamp } = cache.get(key);
        if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
        }
        cache.delete(key);
    }
    return null;
};

const setCache = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
};

export const API = {
    // Fetch by name (used for search suggestions mainly)
    searchByName: async (name) => {
        const normalized = normalizeName(name);
        const cacheKey = `name_${normalized}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${BASE_URL}/name/${normalized}`);
            if (!response.ok) return [];
            const data = await response.json();
            setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    // Fetch by code (preferred for precise navigation)
    fetchByCode: async (code) => {
        const cacheKey = `code_${code}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`${BASE_URL}/alpha/${code}`);
            if (!response.ok) throw new Error('Country not found');
            const data = await response.json();
            const country = data[0];
            setCache(cacheKey, country);
            return country;
        } catch (error) {
            throw error;
        }
    },

    // Fetch multiple codes (for neighbors/comparison)
    fetchByCodes: async (codesArray) => {
        if (!codesArray || codesArray.length === 0) return [];
        
        // Check cache first for individual codes
        const uncached = codesArray.filter(code => !getCached(`code_${code}`));
        
        if (uncached.length > 0) {
            try {
                const response = await fetch(`${BASE_URL}/alpha?codes=${uncached.join(',')}`);
                if (response.ok) {
                    const data = await response.json();
                    data.forEach(country => {
                        setCache(`code_${country.cca3}`, country);
                    });
                }
            } catch (error) {
                console.error('Bulk fetch error:', error);
            }
        }

        // Return all from cache/memory
        return codesArray.map(code => getCached(`code_${code}`)).filter(Boolean);
    },

    // Get boundaries (Using OpenStreetMap Nominatim as fallback for free polygons)
    // Note: REST Countries doesn't provide polygons. 
    // We will simulate this requirement by returning null and handling it in map module via markers/zoom
    // or attempting a fetch to OSM if critical.
    fetchBoundaries: async (name) => {
        // Implementation for OSM polygons if needed, 
        // strictly using free APIs as requested.
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?country=${name}&polygon_geojson=1&format=json`, {
                headers: {
                    'User-Agent': 'CountryExplorerApp/1.0'
                }
            });
            const data = await response.json();
            return data[0]?.geojson;
        } catch (e) {
            console.warn('Boundary fetch failed', e);
            return null;
        }
    }
};
// Format numbers with commas/abbreviations
export const formatNumber = (num) => {
    if (!num) return 'N/A';
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + ' M';
    }
    return new Intl.NumberFormat().format(num);
};

// Calculate Population Density
export const calculateDensity = (pop, area) => {
    if (!pop || !area) return 'N/A';
    return (pop / area).toFixed(2);
};

// Debounce function
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Common Country Aliases
export const countryAliases = {
    'usa': 'United States',
    'uk': 'United Kingdom',
    'uae': 'United Arab Emirates',
    'russia': 'Russian Federation',
    'south korea': 'Republic of Korea',
    'north korea': 'Democratic People\'s Republic of Korea',
    'syria': 'Syrian Arab Republic',
    'iran': 'Iran (Islamic Republic of)',
    'vietnam': 'Viet Nam',
    'laos': 'Lao People\'s Democratic Republic',
    'bolivia': 'Bolivia (Plurinational State of)',
    'venezuela': 'Venezuela (Bolivarian Republic of)',
    'tanzania': 'United Republic of Tanzania',
    'congo': 'Democratic Republic of the Congo',
    'dr congo': 'Democratic Republic of the Congo',
    'ivory coast': 'Côte d\'Ivoire'
};

export const normalizeName = (name) => {
    const lower = name.toLowerCase().trim();
    return countryAliases[lower] || name;
};
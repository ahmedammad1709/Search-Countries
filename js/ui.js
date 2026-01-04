import { formatNumber, calculateDensity } from './utils.js';
import { Storage } from './storage.js';

export const UI = {
    toggleTheme: () => {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        Storage.setTheme(next);
        
        const icon = document.querySelector('#theme-toggle i');
        icon.className = next === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    },

    setLoading: (isLoading) => {
        const loader = document.getElementById('loading-state');
        const content = document.getElementById('country-detail-wrapper');
        const placeholder = document.getElementById('explore-placeholder');
        
        if (isLoading) {
            loader.classList.remove('hidden');
            content.classList.add('hidden');
            placeholder.classList.add('hidden');
        } else {
            loader.classList.add('hidden');
        }
    },

    showError: (msg) => {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = msg;
        errorDiv.classList.remove('hidden');
        UI.setLoading(false);
    },

    renderCountry: (country, neighbors = []) => {
        // DOM Elements
        const flag = document.getElementById('main-flag');
        const name = document.getElementById('country-name');
        const official = document.getElementById('official-name');
        const badges = document.getElementById('country-badges');
        const pop = document.getElementById('stat-pop');
        const area = document.getElementById('stat-area');
        const capital = document.getElementById('stat-capital');
        const region = document.getElementById('stat-region');
        const basicList = document.getElementById('basic-details');
        const insightList = document.getElementById('insight-details');
        const neighborsGrid = document.getElementById('neighbors-grid');
        const content = document.getElementById('country-detail-wrapper');
        const favBtn = document.getElementById('favorite-btn');

        // Basic Data
        flag.src = country.flags.svg;
        flag.alt = country.flags.alt || `Flag of ${country.name.common}`;
        name.textContent = country.name.common;
        official.textContent = country.name.official;
        
        // Stats
        pop.textContent = formatNumber(country.population);
        area.textContent = formatNumber(country.area) + ' km²';
        capital.textContent = country.capital?.[0] || 'N/A';
        region.textContent = `${country.region} (${country.subregion || ''})`;

        // Badges (UN Member, Independent)
        badges.innerHTML = '';
        if (country.unMember) badges.innerHTML += '<span class="badge">UN Member</span>';
        if (country.independent) badges.innerHTML += '<span class="badge">Independent</span>';

        // Favorite State
        const isFav = Storage.isFavorite(country.cca3);
        favBtn.innerHTML = isFav ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
        favBtn.classList.toggle('active', isFav);
        favBtn.onclick = () => {
            if (Storage.isFavorite(country.cca3)) {
                Storage.removeFavorite(country.cca3);
                favBtn.innerHTML = '<i class="far fa-heart"></i>';
                favBtn.classList.remove('active');
            } else {
                Storage.addFavorite(country);
                favBtn.innerHTML = '<i class="fas fa-heart"></i>';
                favBtn.classList.add('active');
            }
        };

        // Detailed Lists
        const languages = Object.values(country.languages || {}).join(', ');
        const currencies = Object.values(country.currencies || {}).map(c => `${c.name} (${c.symbol})`).join(', ');
        const tlds = (country.tld || []).join(', ');

        basicList.innerHTML = `
            <li><strong>Languages:</strong> ${languages}</li>
            <li><strong>Currencies:</strong> ${currencies}</li>
            <li><strong>Demonym:</strong> ${country.demonyms?.eng?.m || 'N/A'}</li>
            <li><strong>Timezones:</strong> ${country.timezones?.[0]} ${country.timezones?.length > 1 ? `(+${country.timezones.length - 1} more)` : ''}</li>
            <li><strong>TLD:</strong> ${tlds}</li>
        `;

        // Derived Insights
        const density = calculateDensity(country.population, country.area);
        const borderCount = country.borders?.length || 0;
        
        insightList.innerHTML = `
            <li><strong>Population Density:</strong> ${density} people/km²</li>
            <li><strong>Neighbors:</strong> ${borderCount} countries</li>
            <li><strong>Latitude:</strong> ${country.latlng?.[0].toFixed(2)}</li>
            <li><strong>Longitude:</strong> ${country.latlng?.[1].toFixed(2)}</li>
            <li><strong>Driving Side:</strong> ${country.car?.side?.toUpperCase()}</li>
        `;

        // Neighbors
        neighborsGrid.innerHTML = '';
        if (neighbors.length === 0) {
            neighborsGrid.innerHTML = '<p class="no-data">No neighboring countries.</p>';
        } else {
            neighbors.forEach(n => {
                const div = document.createElement('div');
                div.className = 'neighbor-card';
                div.innerHTML = `
                    <div class="neighbor-flag">
                        <img src="${n.flags.svg}" alt="${n.name.common}">
                    </div>
                    <div class="neighbor-info">
                        <h4>${n.name.common}</h4>
                    </div>
                `;
                div.onclick = () => window.dispatchEvent(new CustomEvent('country-select', { detail: n.cca3 }));
                neighborsGrid.appendChild(div);
            });
        }

        content.classList.remove('hidden');
        document.getElementById('explore-placeholder').classList.add('hidden');
    },

    renderComparison: (c1, c2) => {
        const container = document.getElementById('comparison-result');
        if (!c1 || !c2) return;

        const getArrow = (val1, val2) => {
            if (val1 > val2) return '<span class="cmp-indicator up">▲</span>';
            if (val1 < val2) return '<span class="cmp-indicator down">▼</span>';
            return '<span class="cmp-indicator eq">=</span>';
        };

        const pop1 = c1.population;
        const pop2 = c2.population;
        const area1 = c1.area;
        const area2 = c2.area;
        const dens1 = c1.population / c1.area;
        const dens2 = c2.population / c2.area;

        container.innerHTML = `
            <div class="cmp-header">
                <div class="cmp-country">
                    <img src="${c1.flags.svg}" class="cmp-flag">
                    <h3>${c1.name.common}</h3>
                </div>
                <div class="cmp-vs">Metric</div>
                <div class="cmp-country">
                    <img src="${c2.flags.svg}" class="cmp-flag">
                    <h3>${c2.name.common}</h3>
                </div>
            </div>

            <div class="cmp-row">
                <div class="cmp-val">${formatNumber(pop1)} ${getArrow(pop1, pop2)}</div>
                <div class="cmp-label">Population</div>
                <div class="cmp-val">${getArrow(pop2, pop1)} ${formatNumber(pop2)}</div>
            </div>

            <div class="cmp-row">
                <div class="cmp-val">${formatNumber(area1)} km² ${getArrow(area1, area2)}</div>
                <div class="cmp-label">Area</div>
                <div class="cmp-val">${getArrow(area2, area1)} ${formatNumber(area2)} km²</div>
            </div>

            <div class="cmp-row">
                <div class="cmp-val">${dens1.toFixed(1)} /km² ${getArrow(dens1, dens2)}</div>
                <div class="cmp-label">Density</div>
                <div class="cmp-val">${getArrow(dens2, dens1)} ${dens2.toFixed(1)} /km²</div>
            </div>

            <div class="cmp-row">
                <div class="cmp-val">${c1.region}</div>
                <div class="cmp-label">Region</div>
                <div class="cmp-val">${c2.region}</div>
            </div>
             <div class="cmp-row">
                <div class="cmp-val">${Object.keys(c1.languages || {}).length}</div>
                <div class="cmp-label">Languages Count</div>
                <div class="cmp-val">${Object.keys(c2.languages || {}).length}</div>
            </div>
        `;

        container.classList.remove('hidden');
        document.getElementById('compare-placeholder').classList.add('hidden');
    },

    renderList: (countries, title, onSelect, onRemove) => {
        const grid = document.getElementById('list-grid');
        const empty = document.getElementById('list-empty');
        document.getElementById('list-title').textContent = title;

        grid.innerHTML = '';
        if (countries.length === 0) {
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        countries.forEach(c => {
            const div = document.createElement('div');
            div.className = 'list-card';
            div.innerHTML = `
                <img src="${c.flag}" alt="${c.name}">
                <div class="list-info">
                    <h4>${c.name}</h4>
                </div>
                ${onRemove ? `<button class="remove-btn" title="Remove"><i class="fas fa-trash"></i></button>` : ''}
            `;
            
            div.onclick = (e) => {
                if (!e.target.closest('.remove-btn')) {
                    onSelect(c.cca3);
                }
            };

            if (onRemove) {
                const btn = div.querySelector('.remove-btn');
                btn.onclick = (e) => {
                    e.stopPropagation();
                    onRemove(c.cca3);
                    // Re-render
                    div.remove();
                    if (grid.children.length === 0) empty.classList.remove('hidden');
                };
            }

            grid.appendChild(div);
        });
    }
};
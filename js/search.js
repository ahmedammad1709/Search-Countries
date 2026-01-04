import { API } from './api.js';
import { debounce, normalizeName } from './utils.js';

export const Search = {
    init: (inputId, suggestionsId, onSelect, onClear) => {
        const input = document.getElementById(inputId);
        const suggestionsBox = document.getElementById(suggestionsId);
        const clearBtn = document.getElementById('clear-search');

        if (!input || !suggestionsBox) return;

        const handleSearch = debounce(async (e) => {
            const query = e.target.value.trim();
            
            // Toggle clear button
            if (clearBtn) {
                if (query.length > 0) clearBtn.classList.remove('hidden');
                else clearBtn.classList.add('hidden');
            }

            if (query.length < 2) {
                suggestionsBox.classList.add('hidden');
                return;
            }

            const results = await API.searchByName(query);
            
            if (results.length > 0) {
                renderSuggestions(results, query);
            } else {
                suggestionsBox.innerHTML = '<div class="suggestion-item">No matches found</div>';
                suggestionsBox.classList.remove('hidden');
            }
        }, 300);

        const renderSuggestions = (countries, query) => {
            const html = countries.slice(0, 5).map(country => {
                const name = country.name.common;
                const flag = country.flags.svg;
                // Highlight match logic could go here
                return `
                    <div class="suggestion-item" data-code="${country.cca3}">
                        <img src="${flag}" alt="" class="suggestion-flag">
                        <span>${name}</span>
                    </div>
                `;
            }).join('');

            suggestionsBox.innerHTML = html;
            suggestionsBox.classList.remove('hidden');

            // Add click listeners
            suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const code = item.dataset.code;
                    if (code) {
                        input.value = item.querySelector('span').innerText;
                        suggestionsBox.classList.add('hidden');
                        onSelect(code);
                    }
                });
            });
        };

        input.addEventListener('input', handleSearch);

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.classList.add('hidden');
            }
        });

        // Clear button logic
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                suggestionsBox.classList.add('hidden');
                clearBtn.classList.add('hidden');
                input.focus();
                if (onClear) onClear();
            });
        }
    }
};
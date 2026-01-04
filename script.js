const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const countryContainer = document.getElementById('country-container');
const neighborsSection = document.getElementById('neighbors-section');
const neighborsContainer = document.getElementById('neighbors-container');
const errorMessage = document.getElementById('error-message');

searchBtn.addEventListener('click', () => {
    const countryName = countryInput.value.trim();
    if (countryName) {
        getCountryData(countryName);
    }
});

countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const countryName = countryInput.value.trim();
        if (countryName) {
            getCountryData(countryName);
        }
    }
});

const getCountryData = async (countryName) => {
    try {
        // Reset UI
        errorMessage.classList.add('hidden');
        countryContainer.classList.add('hidden');
        neighborsSection.classList.add('hidden');
        neighborsContainer.innerHTML = '';
        
        // Show loading state (optional enhancement could be added here)
        
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
        
        if (!response.ok) {
            throw new Error('Country not found. Please check the spelling and try again.');
        }
        
        const data = await response.json();
        // The API returns an array, we take the first result
        renderCountry(data[0]);
        
    } catch (err) {
        renderError(err.message);
    }
};

const renderCountry = (data) => {
    // Extracting data
    const flag = data.flags.svg;
    const name = data.name.common;
    const nativeName = Object.values(data.name.nativeName || {})[0]?.common || name;
    const population = (data.population / 1000000).toFixed(1) + ' M';
    const region = data.region;
    const capital = data.capital ? data.capital[0] : 'N/A';
    const languages = Object.values(data.languages || {}).join(', ');
    const currency = Object.values(data.currencies || {})[0]?.name || 'N/A';
    const borders = data.borders;

    const html = `
        <article class="country-card">
            <div class="country-flag">
                <img src="${flag}" alt="Flag of ${name}">
            </div>
            <div class="country-details">
                <h2 class="country-name">${name}</h2>
                <h3 class="country-native-name">${nativeName}</h3>
                
                <div class="country-info-row">
                    <span class="label">Population:</span>
                    <span class="value">${population}</span>
                </div>
                <div class="country-info-row">
                    <span class="label">Region:</span>
                    <span class="value">${region}</span>
                </div>
                <div class="country-info-row">
                    <span class="label">Capital:</span>
                    <span class="value">${capital}</span>
                </div>
                <div class="country-info-row">
                    <span class="label">Languages:</span>
                    <span class="value">${languages}</span>
                </div>
                <div class="country-info-row">
                    <span class="label">Currency:</span>
                    <span class="value">${currency}</span>
                </div>

                ${borders ? `<button class="neighbors-btn" onclick="getNeighbors('${borders.join(',')}')">Show Neighbors</button>` : '<p class="value" style="margin-top: 1rem;">No neighboring countries</p>'}
            </div>
        </article>
    `;

    countryContainer.innerHTML = html;
    countryContainer.classList.remove('hidden');
};

// Make this function globally available for the onclick event
window.getNeighbors = async (borderCodes) => {
    if (!borderCodes) return;

    try {
        const neighborsBtn = document.querySelector('.neighbors-btn');
        if (neighborsBtn) {
            neighborsBtn.textContent = 'Loading...';
            neighborsBtn.disabled = true;
        }

        const response = await fetch(`https://restcountries.com/v3.1/alpha?codes=${borderCodes}`);
        
        if (!response.ok) {
            throw new Error('Could not fetch neighbors.');
        }
        
        const data = await response.json();
        renderNeighbors(data);
        
        if (neighborsBtn) {
            neighborsBtn.textContent = 'Show Neighbors';
            neighborsBtn.disabled = false;
        }
    } catch (err) {
        renderError(err.message);
        if (document.querySelector('.neighbors-btn')) {
            document.querySelector('.neighbors-btn').textContent = 'Show Neighbors';
            document.querySelector('.neighbors-btn').disabled = false;
        }
    }
};

const renderNeighbors = (data) => {
    neighborsContainer.innerHTML = '';
    
    data.forEach(country => {
        const flag = country.flags.svg;
        const name = country.name.common;
        
        const card = document.createElement('div');
        card.className = 'neighbor-card';
        card.innerHTML = `
            <div class="neighbor-flag">
                <img src="${flag}" alt="Flag of ${name}">
            </div>
            <div class="neighbor-info">
                <h3 class="neighbor-name">${name}</h3>
            </div>
        `;
        
        card.addEventListener('click', () => {
            countryInput.value = name;
            getCountryData(name);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        neighborsContainer.appendChild(card);
    });
    
    neighborsSection.classList.remove('hidden');
    // Scroll to neighbors section
    neighborsSection.scrollIntoView({ behavior: 'smooth' });
};

const renderError = (msg) => {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
};

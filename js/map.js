// Leaflet is loaded globally via script tag in index.html

let map = null;
let currentLayer = null;
let markers = [];

export const MapView = {
    init: (containerId) => {
        if (!document.getElementById(containerId)) return;
        
        // Initialize map if not already done
        if (!map) {
            map = L.map(containerId).setView([20, 0], 2);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }
    },

    focusCountry: async (country, neighbors = []) => {
        if (!map) MapView.init('map-container');
        
        // Clear existing markers/layers
        if (currentLayer) map.removeLayer(currentLayer);
        markers.forEach(m => map.removeLayer(m));
        markers = [];

        const latlng = country.latlng;
        if (!latlng) return;

        // Add marker for main country
        const mainMarker = L.marker(latlng).addTo(map)
            .bindPopup(`<b>${country.name.common}</b><br>Capital: ${country.capital?.[0] || 'N/A'}`)
            .openPopup();
        markers.push(mainMarker);

        // Center map
        map.setView(latlng, 5);

        // If neighbors provided, add markers for them
        neighbors.forEach(n => {
            if (n.latlng) {
                const m = L.marker(n.latlng, { opacity: 0.7 }).addTo(map)
                    .bindPopup(`<b>${n.name.common}</b> (Neighbor)`);
                markers.push(m);
            }
        });

        // Fit bounds to include all markers if neighbors exist
        if (markers.length > 1) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }

        // Fix map rendering issues when container was hidden
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    },

    refresh: () => {
        if (map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }
};
/* ==========================================================================
   5. SEARCH.JS — Motor de Busca de Endereços (Gazetteer Local + Nominatim OSM)
   ========================================================================== */

window.AppSearch = {
    debounceTimer: null,

    normalizeStr: function (str) {
        return (str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .trim();
    },

    searchLocalLocations: function (query) {
        const rawNorm = this.normalizeStr(query);
        if (!rawNorm) return AppConfig.POPULAR_LOCATIONS.slice(0, 10);

        let expandedQuery = rawNorm;
        for (const [k, v] of Object.entries(AppConfig.SEARCH_ALIASES)) {
            if (rawNorm.includes(k)) {
                expandedQuery += ' ' + v;
            }
        }

        const tokens = expandedQuery.split(/\s+/).filter(t => t.length > 0);
        const scored = [];

        for (const item of AppConfig.POPULAR_LOCATIONS) {
            const targetText = this.normalizeStr(item.name + ' ' + item.bairro + ' ' + (item.tags || ''));
            let matchCount = 0;
            let exactPrefix = false;

            for (const t of tokens) {
                if (targetText.includes(t)) {
                    matchCount++;
                    if (targetText.startsWith(t) || this.normalizeStr(item.name).startsWith(t)) {
                        exactPrefix = true;
                    }
                }
            }

            if (matchCount > 0) {
                let score = (matchCount / tokens.length) * 10;
                if (exactPrefix) score += 5;
                if (targetText.includes(rawNorm)) score += 8;
                scored.push({ item, score });
            }
        }

        scored.sort((a, b) => b.score - a.score);
        return scored.map(s => s.item);
    },

    renderSuggestions: function (list) {
        const searchSuggestions = document.getElementById('searchSuggestions');
        if (!list || list.length === 0) {
            searchSuggestions.innerHTML = '<div class="suggestion-item"><i data-lucide="info" style="width:14px;height:14px;"></i><span class="suggestion-text">Nenhuma rua encontrada em São Roque.</span></div>';
            searchSuggestions.classList.add('visible');
            lucide.createIcons();
            return;
        }
        searchSuggestions.innerHTML = list.map(item => `
            <div class="suggestion-item" data-name="${item.name}" data-bairro="${item.bairro || 'São Roque'}" data-lat="${item.coords[0]}" data-lng="${item.coords[1]}">
                <i data-lucide="map-pin" style="width: 14px; height: 14px;"></i>
                <span class="suggestion-text"><strong>${item.name}</strong></span>
                <span class="suggestion-badge">${item.bairro || 'São Roque'}</span>
            </div>
        `).join('');
        searchSuggestions.classList.add('visible');
        lucide.createIcons();

        searchSuggestions.querySelectorAll('.suggestion-item').forEach(el => {
            el.addEventListener('click', () => {
                const name = el.dataset.name;
                const bairro = el.dataset.bairro;
                const lat = parseFloat(el.dataset.lat);
                const lng = parseFloat(el.dataset.lng);
                this.selectStreet(name, bairro, lat, lng);
            });
        });
    },

    selectStreet: function (name, bairro, lat, lng) {
        const streetInput = document.getElementById('streetInput');
        const searchSuggestions = document.getElementById('searchSuggestions');
        const btnSearchClear = document.getElementById('btnSearchClear');
        const map = AppState.map;

        streetInput.value = name;
        searchSuggestions.classList.remove('visible');
        btnSearchClear.style.display = 'flex';

        if (AppState.streetMarker) map.removeLayer(AppState.streetMarker);

        const pulseIcon = L.divIcon({
            className: 'street-pulse-pin-wrap',
            html: '<div class="street-pulse-pin"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        AppState.streetMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(map);
        map.flyTo([lat, lng], 16, { duration: 1.4 });

        AppDiagnostics.showStreetImpactModal(name, bairro, lat, lng);
    },

    init: function () {
        const streetInput = document.getElementById('streetInput');
        const searchSuggestions = document.getElementById('searchSuggestions');
        const btnSearchClear = document.getElementById('btnSearchClear');
        const btnSearchGo = document.getElementById('btnSearchGo');

        streetInput.addEventListener('focus', () => {
            if (!streetInput.value.trim()) {
                this.renderSuggestions(AppConfig.POPULAR_LOCATIONS);
            }
        });

        streetInput.addEventListener('input', () => {
            const q = streetInput.value.trim();
            btnSearchClear.style.display = q ? 'flex' : 'none';

            if (!q) {
                this.renderSuggestions(AppConfig.POPULAR_LOCATIONS.slice(0, 10));
                return;
            }

            const localMatches = this.searchLocalLocations(q);
            this.renderSuggestions(localMatches);

            clearTimeout(this.debounceTimer);
            if (q.length >= 3) {
                this.debounceTimer = setTimeout(() => {
                    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ', Sao Roque, SP, Brasil')}&limit=3&countrycodes=br`;
                    fetch(nominatimUrl, { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } })
                        .then(res => res.json())
                        .then(data => {
                            if (!data || data.length === 0) return;
                            const remoteList = data.map(d => {
                                const parts = d.display_name.split(',');
                                return {
                                    name: parts[0].trim(),
                                    bairro: parts[1] ? parts[1].trim() : 'São Roque',
                                    coords: [parseFloat(d.lat), parseFloat(d.lon)]
                                };
                            });
                            const merged = [...localMatches];
                            remoteList.forEach(r => {
                                if (!merged.some(m => Math.abs(m.coords[0] - r.coords[0]) < 0.003 && Math.abs(m.coords[1] - r.coords[1]) < 0.003)) {
                                    merged.push(r);
                                }
                            });
                            this.renderSuggestions(merged);
                        })
                        .catch(() => {});
                }, 400);
            }
        });

        streetInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const first = searchSuggestions.querySelector('.suggestion-item');
                if (first && first.dataset.lat) {
                    this.selectStreet(first.dataset.name, first.dataset.bairro, parseFloat(first.dataset.lat), parseFloat(first.dataset.lng));
                }
            }
        });

        btnSearchGo.addEventListener('click', () => {
            const first = searchSuggestions.querySelector('.suggestion-item');
            if (first && first.dataset.lat) {
                this.selectStreet(first.dataset.name, first.dataset.bairro, parseFloat(first.dataset.lat), parseFloat(first.dataset.lng));
            } else if (streetInput.value.trim()) {
                const q = streetInput.value.trim();
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ', Sao Roque, SP, Brasil')}&limit=1&countrycodes=br`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            this.selectStreet(q, 'São Roque', parseFloat(data[0].lat), parseFloat(data[0].lon));
                        } else {
                            alert('Endereço não localizado com precisão em São Roque. Tente um nome próximo.');
                        }
                    });
            }
        });

        btnSearchClear.addEventListener('click', () => {
            streetInput.value = '';
            btnSearchClear.style.display = 'none';
            searchSuggestions.classList.remove('visible');
            if (AppState.streetMarker) {
                AppState.map.removeLayer(AppState.streetMarker);
                AppState.streetMarker = null;
            }
            AppMap.recenter();
        });

        document.addEventListener('click', (e) => {
            const wrapper = document.getElementById('searchWrapper');
            if (wrapper && !wrapper.contains(e.target)) {
                searchSuggestions.classList.remove('visible');
            }
        });
    }
};

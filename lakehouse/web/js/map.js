/* ==========================================================================
   3. MAP.JS — Inicialização do Leaflet, Cores, Camadas Vetoriais e Modos
      (Todo clique em zona, ponto crítico ou risco abre direto o modal-card)
   ========================================================================== */

window.AppMap = {
    init: function () {
        const map = L.map('map', {
            zoomControl: false,
            attributionControl: false,
            maxBounds: AppConfig.MAP_MAX_BOUNDS,
            minZoom: 10,
            preferCanvas: true
        });

        AppState.map = map;
        map.fitBounds(AppConfig.SAO_ROQUE_BOUNDS, { padding: [20, 20] });

        L.tileLayer(AppConfig.TILE_BASE_URL, {
            maxZoom: 16,
            minZoom: 10,
            attribution: '© Esri, HERE, OpenStreetMap'
        }).addTo(map);

        map.createPane('streetLabels');
        map.getPane('streetLabels').style.zIndex = 650;
        map.getPane('streetLabels').style.pointerEvents = 'none';

        L.tileLayer(AppConfig.TILE_LABELS_URL, {
            maxZoom: 16,
            minZoom: 10,
            pane: 'streetLabels'
        }).addTo(map);

        this.initLayers();
    },

    getZoneColor: function (name) {
        const n = (name || '').toLowerCase();
        if (n.includes('rural')) return '#4ade80';
        if (n.includes('turístic') || n.includes('turistico')) return '#f59e0b';
        if (n.includes('manancial')) return '#06b6d4';
        if (n.includes('estratégica') || n.includes('estrategica') || n.includes('zucaer')) return '#ef4444';
        if (n.includes('média') || n.includes('media')) return '#f97316';
        if (n.includes('baixa')) return '#eab308';
        if (n.includes('industrial')) return '#8b5cf6';
        if (n.includes('central') || n.includes('consolidação') || n.includes('consolidacao')) return '#3b82f6';
        if (n.includes('preservação') || n.includes('preservacao') || n.includes('zupa')) return '#10b981';
        return '#94a3b8';
    },

    initLayers: function () {
        const bundle = AppState.bundle;
        const self = this;

        // Camada Proposta 2026 — abre diretamente o modal-card com impacto negativo
        AppState.layers.z2026 = L.geoJSON(bundle.zoneamento_2026, {
            style: function (feat) {
                return {
                    fillColor: self.getZoneColor(feat.properties.nome_zona),
                    fillOpacity: 0.42,
                    color: '#ffffff',
                    weight: 1.2,
                    opacity: 0.75
                };
            },
            onEachFeature: function (feat, layer) {
                layer.on('click', (e) => AppDiagnostics.openZoneModal(feat.properties, 'PROPOSTA 2026 • VOTAÇÃO IMINENTE', layer, e.latlng));
            }
        });

        // Camada Vigente 2006 — abre diretamente o modal-card comparando com 2026
        AppState.layers.z2006 = L.geoJSON(bundle.zoneamento_2006, {
            style: function (feat) {
                return {
                    fillColor: self.getZoneColor(feat.properties.nome_zona),
                    fillOpacity: 0.42,
                    color: '#ffffff',
                    weight: 1.2,
                    opacity: 0.75
                };
            },
            onEachFeature: function (feat, layer) {
                layer.on('click', (e) => AppDiagnostics.openZoneModal(feat.properties, 'COMPARATIVO: LEI VIGENTE (2006) vs PROPOSTA (2026)', layer, e.latlng));
            }
        });

        // Camada de Auditoria Spot Zoning
        AppState.layers.spotZoning = L.geoJSON(bundle.spot_zoning, {
            style: function (feat) {
                const props = feat.properties;
                const isSpot = (props.score_spot_zoning >= 35) || props.is_spot_zoning;
                if (isSpot) {
                    return {
                        fillColor: '#ef4444',
                        fillOpacity: 0.68,
                        color: '#b91c1c',
                        weight: 2.5,
                        opacity: 1.0
                    };
                } else {
                    return {
                        fillColor: '#1e293b',
                        fillOpacity: 0.15,
                        color: 'rgba(255, 255, 255, 0.15)',
                        weight: 1.0,
                        opacity: 0.4
                    };
                }
            },
            onEachFeature: function (feat, layer) {
                layer.on('click', () => AppDiagnostics.showSpotZoningCard(feat.properties, layer));
            }
        });
    },

    renderCasos: function () {
        const map = AppState.map;
        if (AppState.layers.casos) map.removeLayer(AppState.layers.casos);

        AppState.layers.casos = L.geoJSON(AppState.bundle.casos_emblematicos, {
            pointToLayer: function (feat, latlng) {
                const label = feat.properties.id.replace('CASO_', 'C');
                const cor = feat.properties.cor || '#ef4444';
                const icon = L.divIcon({
                    className: 'caso-pin-wrap',
                    html: `<div class="marker-pin-caso" style="background: ${cor}">${label}</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });
                return L.marker(latlng, { icon: icon });
            },
            onEachFeature: function (feat, layer) {
                layer.on('click', () => {
                    const coords = feat.geometry.coordinates;
                    AppDiagnostics.openPointModal(feat.properties, 'DOSSIÊ CRÍTICO DE IMPACTO NEGATIVO', coords[1], coords[0]);
                });
            }
        }).addTo(map);
    },

    renderRiscos: function () {
        const map = AppState.map;
        if (AppState.layers.riscos) map.removeLayer(AppState.layers.riscos);

        AppState.layers.riscos = L.geoJSON(AppState.bundle.riscos_urbanos, {
            pointToLayer: function (feat, latlng) {
                const cor = feat.properties.cor || '#f59e0b';
                const icon = L.divIcon({
                    className: 'risco-pin-wrap',
                    html: `<div class="marker-pin-risco" style="background: ${cor}">!</div>`,
                    iconSize: [26, 26],
                    iconAnchor: [13, 13]
                });
                return L.marker(latlng, { icon: icon });
            },
            onEachFeature: function (feat, layer) {
                layer.on('click', () => {
                    const coords = feat.geometry.coordinates;
                    AppDiagnostics.openPointModal(feat.properties, 'ALERTA DE RISCO GEOLÓGICO & URBANO', coords[1], coords[0]);
                });
            }
        }).addTo(map);
    },

    updateMapMode: function (mode) {
        const map = AppState.map;
        AppState.mode = mode;

        map.removeLayer(AppState.layers.z2026);
        map.removeLayer(AppState.layers.z2006);
        if (AppState.layers.spotZoning) map.removeLayer(AppState.layers.spotZoning);

        const banner = document.getElementById('impactBanner');
        const modalEl = document.getElementById('streetModal');
        if (modalEl) modalEl.classList.remove('visible');

        if (mode === 'hoje') {
            AppState.layers.z2006.addTo(map);
            if (banner) {
                banner.innerHTML = '<i data-lucide="clock" style="width: 16px; height: 16px; flex-shrink: 0;"></i><span><strong>Lei Vigente (2006):</strong> Toque em qualquer área do mapa para comparar como é hoje e o impacto negativo do que querem votar.</span>';
                banner.classList.add('visible');
                lucide.createIcons();
            }
            if (AppState.layers.riscos) map.removeLayer(AppState.layers.riscos);
            if (AppState.layers.casos) map.removeLayer(AppState.layers.casos);
        } else if (mode === 'proposta') {
            AppState.layers.z2026.addTo(map);
            if (banner) {
                banner.innerHTML = '<i data-lucide="alert-triangle" style="width: 16px; height: 16px; flex-shrink: 0;"></i><span><strong>Votação Iminente na Câmara:</strong> A proposta elimina 1.670 ha de solo rural (-12,7%) e dobra áreas de prédios sem rede de esgoto. Toque no mapa!</span>';
                banner.classList.add('visible');
                lucide.createIcons();
            }
            this.renderCasos();
            this.renderRiscos();
        } else if (mode === 'spot_zoning') {
            AppState.layers.spotZoning.addTo(map);
            if (banner) {
                banner.innerHTML = '<i data-lucide="shield-alert" style="width: 16px; height: 16px; flex-shrink: 0;"></i><span><strong>Auditoria de Privilégios (Spot Zoning):</strong> Exibindo áreas com regras sob medida para grandes empreendimentos. Toque no mapa!</span>';
                banner.classList.add('visible');
                lucide.createIcons();
            }
            this.renderCasos();
            this.renderRiscos();
        }
    },

    recenter: function () {
        if (AppState.map) {
            AppState.map.fitBounds(AppConfig.SAO_ROQUE_BOUNDS, { padding: [20, 20] });
        }
    }
};

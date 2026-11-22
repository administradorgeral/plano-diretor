/* ==========================================================================
   4. DIAGNOSTICS.JS — Modal-Card Unificado de Impacto Negativo (Sem info-card)
      Contempla dados reais das Minutas LCs 39 e 40/2026, CPRM, Sabesp e TJ-SP
   ========================================================================== */

window.AppDiagnostics = {
    pointInPolygon: function (point, vs) {
        const x = point[0], y = point[1];
        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i][0], yi = vs[i][1];
            const xj = vs[j][0], yj = vs[j][1];
            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    },

    findZoneForCoord: function (lng, lat, featureCollection) {
        if (!featureCollection || !featureCollection.features) return null;
        for (const feat of featureCollection.features) {
            const geom = feat.geometry;
            if (!geom) continue;
            if (geom.type === 'Polygon') {
                if (this.pointInPolygon([lng, lat], geom.coordinates[0])) return feat.properties;
            } else if (geom.type === 'MultiPolygon') {
                for (const poly of geom.coordinates) {
                    if (this.pointInPolygon([lng, lat], poly[0])) return feat.properties;
                }
            }
        }
        return null;
    },

    // Abre diretamente o Modal-Card ao clicar em qualquer polígono de Zona no mapa
    openZoneModal: function (props, tagLabel, layer, clickLatLng) {
        let center = clickLatLng;
        if (!center) {
            if (layer && typeof layer.getBounds === 'function') {
                center = layer.getBounds().getCenter();
            } else {
                center = AppState.map.getCenter();
            }
        }
        AppState.lastSelectedZone = { props: props, center: center, timeLabel: tagLabel };

        const zoneName = props.nome_zona || 'Zona Urbanística';
        const areaStr = props.area_ha ? `${Math.round(props.area_ha).toLocaleString('pt-BR')} hectares` : 'Área Municipal';

        this.showStreetImpactModal(zoneName, areaStr, center.lat, center.lng, props, null, tagLabel);
    },

    // Abre diretamente o Modal-Card ao clicar em qualquer Pino Crítico (C1..C4) ou Pino de Risco (!)
    openPointModal: function (props, categoryLabel, lat, lng) {
        const dossierDetails = {
            'CASO_01': {
                lei: 'Minuta LC 40/2026 (Anexo I) & LC 66/2012 (ZUCAer)',
                negativo: 'Libera prédios de 10 andares (30m em gleba / até 100m em lote) e 60% de impermeabilização para o complexo privado de 520 ha (JHSF), enquanto proprietários e sítios vizinhos num raio de 10 km sofrem restrição severa de altura pelo cone aeronáutico (PBZPA/DECEA). O complexo não possui rede coletora pública de esgoto da Sabesp.'
            },
            'CASO_02': {
                lei: 'Minuta LC 40/2026, Art. 36, § 1º (Pág. 36) & Lei Estadual 11.579/2003',
                negativo: 'Cria exceção nominal para 4 loteamentos fechados ("Planalto Verde", "Parque Taxaquara", "Chácaras Primavera" e "Patrimônio do Carmo") determinando que o contrato privado de cartório prevaleça sobre a lei ambiental do município dentro da APA de Itupararanga e mananciais do Rio Sorocamirim, ao lado do Quilombo do Carmo.'
            },
            'CASO_03': {
                lei: 'Sugestão nº 57 (Devolutiva DPMA) & Instrução INCRA 17-b',
                negativo: 'Elimina 1.670,71 hectares de Zona Rural (-12,7%), convertendo áreas agrícolas como a Estrada do Candor (108.000 m² convertidos a pedido do setor imobiliário) em zona urbana de média densidade. Força pequenos produtores e chacareiros a pagar IPTU urbano muito mais caro sem rede de água ou esgoto.'
            },
            'CASO_04': {
                lei: 'Inquérito Civil MPSP nº 0439.0000192/2025 & ADIN TJ-SP nº 2048131-35.2024',
                negativo: 'Na Consulta Pública oficial (74 páginas), pedidos de expansão imobiliária foram acolhidos de imediato, enquanto alertas formais do Conselho Municipal de Meio Ambiente (COMDEMA) sobre colapso hídrico e sobreposição ao PDA 2019 foram postergados. A cidade trata apenas 47,8% do esgoto (SNIS/ARSESP).'
            }
        };

        const extraInfo = dossierDetails[props.id] || {
            lei: 'Mapeamento Oficial SGB/CPRM (2023) & Minuta LC 40/2026',
            negativo: props.resumo || 'Área crítica exposta a impacto severo de adensamento, drenagem insuficiente ou risco geológico.'
        };

        const leadBoxHtml = `
            <div class="negative-impact-lead">
                <div class="negative-impact-lead-header">
                    <span class="negative-impact-lead-title">
                        <i data-lucide="alert-octagon" style="width: 17px; height: 17px; color: #ef4444;"></i>
                        ${props.id ? props.id.replace('_', ' ') : 'ALERTA'} • ${(props.categoria || categoryLabel).toUpperCase()}
                    </span>
                    <span class="citizen-badge critico">IMPACTO DIRETO</span>
                </div>
                <div class="negative-impact-lead-body">
                    <strong>O que está em jogo na votação:</strong> ${extraInfo.negativo}
                </div>
                <div style="font-size: 11px; color: #fca5a5; background: rgba(0,0,0,0.35); padding: 6px 10px; border-radius: 6px;">
                    <strong>Base Documental:</strong> ${extraInfo.lei}
                </div>
            </div>
        `;

        this.showStreetImpactModal(props.titulo, props.categoria || categoryLabel, lat, lng, null, leadBoxHtml, categoryLabel);
    },

    showSpotZoningCard: function (props, layer) {
        const streetModal = document.getElementById('streetModal');
        const isSpot = (props.score_spot_zoning >= 35) || props.is_spot_zoning;

        if (!isSpot) {
            if (streetModal) streetModal.classList.remove('visible');
            return;
        }

        let center = null;
        if (layer && typeof layer.getBounds === 'function') {
            center = layer.getBounds().getCenter();
        } else {
            center = AppState.map.getCenter();
        }
        AppState.lastSelectedZone = { props: props, center: center, timeLabel: 'Spot Zoning' };
        AppState.currentInspectedNeighborhood = props.nome_zona || '';

        const score = props.score_spot_zoning || 0;
        const nivel = (props.nivel_spot_zoning || 'Moderado').toUpperCase();
        const diag = props.diagnostico || 'Área com índices urbanísticos sob medida que destoam de todo o entorno.';
        const ilha = Math.round((props.i_ilha || 0) * 100);
        const deltaGab = props.delta_gab_m || 0;
        const deltaTo = props.delta_to_pct || 0;
        const areaHa = props.area_ha ? `${Math.round(props.area_ha).toLocaleString('pt-BR')} ha` : '';

        document.getElementById('modalStreetTag').textContent = `AUDITORIA DE PRIVILÉGIOS • SPOT ZONING (${nivel})`;
        document.getElementById('modalStreetTitle').textContent = `${props.nome_zona || 'Área Auditada'}`;
        document.getElementById('modalStreetMeta').innerHTML = `
            <span>📏 Área: <strong>${areaHa}</strong></span>
            <span>•</span>
            <span>🎯 Score ISZ: <strong style="color:#f87171;">${score}/100</strong></span>
        `;

        const html = `
            <div class="clean-lead-card">
                <div class="clean-lead-header">
                    <span class="clean-lead-title">
                        <i data-lucide="compass" style="width: 15px; height: 15px; color: #38bdf8;"></i>
                        Spot Zoning • Regra sob Medida
                    </span>
                    <span class="clean-lead-badge">
                        ISZ: ${score}/100 • ${nivel}
                    </span>
                </div>

                <p class="clean-lead-text">
                    Esta zona foi desenhada com regras de exceção, permitindo construir mais alto e impermeabilizar mais o solo do que nos terrenos vizinhos, sem obras públicas compensatórias.
                </p>

                <div class="clean-diagnostic-box">
                    <strong>Diagnóstico científico:</strong> ${diag}
                </div>

                <div class="clean-metrics-grid">
                    <div class="clean-metric-item">
                        <span>Ilhamento</span>
                        <strong>${ilha}% dissimilar</strong>
                    </div>
                    <div class="clean-metric-item">
                        <span>Salto de Altura</span>
                        <strong>+${deltaGab}m sobre vizinhos</strong>
                    </div>
                    <div class="clean-metric-item">
                        <span>Ocupação do Solo</span>
                        <strong>+${deltaTo}% de concreto</strong>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalStreetBody').innerHTML = html;
        streetModal.classList.add('visible');
        lucide.createIcons();
    },

    // Construtor Unificado do Modal-Card com Foco no Impacto Negativo Real
    showStreetImpactModal: function (name, bairro, lat, lng, customProps, customLeadBoxHtml, customTag) {
        const bundle = AppState.bundle;
        const streetModal = document.getElementById('streetModal');

        AppState.currentInspectedNeighborhood = bairro && !bairro.includes('hectares') ? `${name} (${bairro})` : name;

        const z06Props = this.findZoneForCoord(lng, lat, bundle.zoneamento_2006);
        let z26Props = customProps || this.findZoneForCoord(lng, lat, bundle.zoneamento_2026);

        let szProps = (customProps && customProps.score_spot_zoning !== undefined)
            ? customProps
            : this.findZoneForCoord(lng, lat, bundle.spot_zoning);

        if (!szProps && z26Props && bundle.spot_zoning && bundle.spot_zoning.features) {
            const matchFeat = bundle.spot_zoning.features.find(f => f.properties.nome_zona === z26Props.nome_zona);
            if (matchFeat) szProps = matchFeat.properties;
        }

        const z06Name = z06Props ? z06Props.nome_zona : 'Rural / Baixa Densidade (2006)';
        const z26Name = z26Props ? z26Props.nome_zona : (customProps ? customProps.nome_zona : 'Zona em Revisão (2026)');

        const n26 = z26Name.toLowerCase();
        const n06 = z06Name.toLowerCase();
        const locName = (name + ' ' + bairro + ' ' + z26Name).toLowerCase();

        const isSpotZoning = szProps && (szProps.score_spot_zoning >= 35 || szProps.is_spot_zoning);

        if (AppState.mode === 'spot_zoning') {
            if (!isSpotZoning) {
                if (streetModal) streetModal.classList.remove('visible');
                return;
            }
            this.showSpotZoningCard(szProps, null);
            return;
        }

        const spec06 = AppConfig.ZONE_SPECS[z06Name] || { gabarito: 'Até 9m (2 andares)', to: '20% a 40%', ca: '0.4 a 1.0' };
        const spec26 = AppConfig.ZONE_SPECS[z26Name] || { gabarito: 'Até 18m a 21m', to: '50% a 70%', ca: '1.2 a 2.4' };
        const areaHa = (customProps && customProps.area_ha) || (z26Props && z26Props.area_ha) || (z06Props && z06Props.area_ha);

        // Preenche o modal-title-wrap unificado
        document.getElementById('modalStreetTag').textContent = (customTag || 'DIAGNÓSTICO CIENTÍFICO').toUpperCase();
        document.getElementById('modalStreetTitle').textContent = bairro && !bairro.includes('hectares') ? `${name} • ${bairro}` : name;
        document.getElementById('modalStreetMeta').innerHTML = `
            <span>Hoje (2006): <strong>${z06Name}</strong></span>
            <span style="color:#64748b;">→</span>
            <span>Proposta (2026): <strong style="color:#38bdf8;">${z26Name}</strong></span>
            ${areaHa ? `<span style="color:#64748b;">•</span> <span>${Math.round(areaHa).toLocaleString('pt-BR')} ha</span>` : ''}
        `;

        // Síntese da Zona no Topo do Modal
        let leadImpactHtml = customLeadBoxHtml || '';
        if (!leadImpactHtml) {
            let leadSummary = 'A proposta altera os parâmetros urbanísticos da região sem estudo prévio de capacidade viária e de esgotamento sanitário.';
            if (n26.includes('rural') || n06.includes('rural')) {
                leadSummary = '<strong>Área Rural em Transição:</strong> Sítios e áreas verdes são convertidos em zona de expansão urbana, gerando pressão imobiliária e substituição do imposto rural (ITR) por IPTU.';
            } else if (n26.includes('turístic') || n26.includes('turistico')) {
                leadSummary = '<strong>Zona de Interesse Turístico:</strong> Avança sobre fragmentos de vegetação e nascentes, liberando prédios de até 18 metros onde não há rede pública de esgoto.';
            } else if (n26.includes('média') || n26.includes('media')) {
                leadSummary = '<strong>Zona de Média Densidade:</strong> A área permitida para prédios dobrou de tamanho, autorizando até 21 metros de altura (7 andares) e cobrindo até 70% do lote com concreto.';
            } else if (n26.includes('estratégica') || n26.includes('zucaer') || n26.includes('desenvolvimento econômico')) {
                leadSummary = '<strong>Zona Estratégica:</strong> Concentra direitos de construção elevados (gabarito até 30m ou 100m) em grandes glebas corporativas, contrastando com as restrições do entorno.';
            } else if (n26.includes('manancial') || n26.includes('zupa')) {
                leadSummary = '<strong>Proteção de Mananciais:</strong> Bacia hídrica essencial para a água potável do município, sujeita a adensamento e exceções para condomínios fechados.';
            }

            leadImpactHtml = `
                <div class="clean-lead-card">
                    <div class="clean-lead-header">
                        <span class="clean-lead-title">
                            <i data-lucide="compass" style="width: 15px; height: 15px; color: #38bdf8;"></i>
                            Diagnóstico científico da região
                        </span>
                    </div>
                    <div class="clean-lead-text">${leadSummary}</div>
                    <div class="clean-metrics-grid">
                        <div class="clean-metric-item">
                            <span>Altura Máxima (2026)</span>
                            <strong>${spec26.gabarito}</strong>
                        </div>
                        <div class="clean-metric-item">
                            <span>Concreto no Lote (TO)</span>
                            <strong>Até ${spec26.to}</strong>
                        </div>
                        <div class="clean-metric-item">
                            <span>Regra Atual (2006)</span>
                            <strong>${spec06.gabarito}</strong>
                        </div>
                    </div>
                </div>
            `;
        }

        let spotZoningBox = '';
        if (isSpotZoning) {
            const spotScore = szProps ? szProps.score_spot_zoning : 0;
            const spotNivel = szProps ? (szProps.nivel_spot_zoning || 'Moderado') : 'Moderado';
            const spotDiag = szProps ? szProps.diagnostico : '';
            const spotIlha = Math.round((szProps.i_ilha || 0) * 100);
            const spotDelta = szProps.delta_gab_m || 0;

            spotZoningBox = `
            <div class="clean-spot-callout">
                <div class="clean-spot-title">
                    <i data-lucide="alert-circle" style="width: 14px; height: 14px; color: #f87171;"></i>
                    Spot Zoning Detectado • ${spotNivel} (${spotScore}/100)
                </div>
                <div class="clean-spot-body">
                    <strong>Diagnóstico científico:</strong> ${spotDiag} (Ilhamento: ${spotIlha}% • Salto de gabarito: +${spotDelta}m sobre vizinhos).
                </div>
            </div>`;
        }

        // Textos simples e diretos para o dia a dia do cidadão
        const isRuralTransition = n06.includes('rural') && !n26.includes('rural');
        const d1Text = isRuralTransition
            ? 'Sítios e chácaras perdem o enquadramento rural (ITR) e passam a receber carnê de IPTU urbano, aumentando impostos anuais sem garantia de saneamento e asfalto.'
            : 'O aumento do potencial de construção valoriza o terreno para novos prédios, refletindo em reajuste na cobrança de IPTU.';

        const isSaneamentoCritico = n26.includes('manancial') || locName.includes('carmo') || locName.includes('canguera') || locName.includes('vinho');
        const d2Text = isSaneamentoCritico
            ? 'Região sem rede de esgoto da Sabesp. Novos condomínios multiplicam poços profundos e fossas sobre áreas de recarga de mananciais.'
            : 'São Roque trata apenas 47,8% do esgoto. Autorizar novos prédios antes de ampliar as estações da Sabesp agrava a falta d\'água no verão.';

        const d3Text = `Autoriza construções de até ${spec26.gabarito} e até ${spec26.to} de concreto no lote, reduzindo o sol, a ventilação e a privacidade das casas vizinhas.`;

        const isViaryBottleneck = locName.includes('mailasqui') || locName.includes('raposo');
        const d4Text = isViaryBottleneck
            ? 'Aumento de veículos sem duplicação de acessos locais gera congestionamentos na Raposo Tavares e vias de ligação.'
            : 'Ruas estreitas de bairro recebem fluxo intenso de novas moradias sem alargamento ou obras viárias.';

        const html = `
            ${leadImpactHtml}
            ${spotZoningBox}

            <div class="clean-impact-grid">
                <div class="clean-impact-item">
                    <div class="clean-impact-header">
                        <i data-lucide="badge-dollar-sign" style="color:#f59e0b;width:15px;height:15px;"></i>
                        <span>1. Seu Bolso &amp; IPTU</span>
                    </div>
                    <div class="clean-impact-body">${d1Text}</div>
                </div>

                <div class="clean-impact-item">
                    <div class="clean-impact-header">
                        <i data-lucide="droplet" style="color:#38bdf8;width:15px;height:15px;"></i>
                        <span>2. Água &amp; Esgoto</span>
                    </div>
                    <div class="clean-impact-body">${d2Text}</div>
                </div>

                <div class="clean-impact-item">
                    <div class="clean-impact-header">
                        <i data-lucide="building" style="color:#60a5fa;width:15px;height:15px;"></i>
                        <span>3. Obras &amp; Vizinhança</span>
                    </div>
                    <div class="clean-impact-body">${d3Text}</div>
                </div>

                <div class="clean-impact-item">
                    <div class="clean-impact-header">
                        <i data-lucide="car" style="color:#a78bfa;width:15px;height:15px;"></i>
                        <span>4. Trânsito &amp; Chuvas</span>
                    </div>
                    <div class="clean-impact-body">${d4Text}</div>
                </div>
            </div>

            <div class="clean-notice-strip">
                ⚖️ <strong>Decisão na Câmara Municipal:</strong> A liberação para construtoras vale imediatamente após a aprovação da lei, enquanto as melhorias de saneamento e viárias não possuem prazo ou verba garantida.
            </div>
        `;

        document.getElementById('modalStreetBody').innerHTML = html;
        streetModal.classList.add('visible');
        lucide.createIcons();
    }
};

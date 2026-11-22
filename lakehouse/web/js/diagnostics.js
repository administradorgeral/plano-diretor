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

    renderInlinePetitionButton: function (contextZone) {
        const count = window.AppPetition ? AppPetition.getTotalCount() : 0;
        const safeZone = (contextZone || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        return `
            <button type="button" class="btn-petition" onclick="AppPetition.openModal('${safeZone}')" style="margin-top: 8px; justify-content: center; width: 100%; font-size: 12.5px; height: 42px;">
                <span class="petition-chevron">&gt;</span>
                <span>Crescer exige responsabilidade!</span>
                <span class="petition-counter-pill">
                    <i data-lucide="pen-tool" style="width: 11px; height: 11px;"></i>
                    <span data-petition-count>${count.toLocaleString('pt-BR')}</span>
                </span>
            </button>
        `;
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
            <div class="spot-zoning-card" style="background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                    <span style="font-size: 13px; font-weight: 900; color: #fca5a5; display: flex; align-items: center; gap: 6px;">
                        <i data-lucide="shield-alert" style="width: 18px; height: 18px; color: #ef4444;"></i>
                        SPOT ZONING DETECTADO: REGRA SOB MEDIDA
                    </span>
                    <span style="background: #ef4444; color: #fff; font-size: 11px; font-weight: 900; padding: 3px 10px; border-radius: 999px;">
                        SCORE ${score}/100 • ${nivel}
                    </span>
                </div>

                <p style="font-size: 13px; color: #f1f5f9; line-height: 1.5; margin: 0;">
                    <strong>Impacto Negativo para a Cidade:</strong> Esta área recebeu <strong>parâmetros de exceção</strong> que permitem construir mais alto e impermeabilizar muito mais o solo do que nos terrenos vizinhos, gerando valorização privada sem contrapartida de infraestrutura pública.
                </p>

                <div style="background: rgba(0,0,0,0.45); border-left: 3px solid #ef4444; border-radius: 6px; padding: 10px 12px; font-size: 12px; color: #f8fafc; line-height: 1.5;">
                    <strong>Laudo Pericial:</strong> ${diag}
                </div>

                <div class="negative-metrics-strip">
                    <div class="negative-metric-box">
                        <span>Ilhamento Territorial</span>
                        <strong>${ilha}% dissimilar</strong>
                    </div>
                    <div class="negative-metric-box">
                        <span>Salto de Altura</span>
                        <strong>+${deltaGab}m sobre vizinhos</strong>
                    </div>
                    <div class="negative-metric-box">
                        <span>Salto de Concreto (TO)</span>
                        <strong>+${deltaTo}% de ocupação</strong>
                    </div>
                </div>

                ${this.renderInlinePetitionButton(props.nome_zona)}
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

        // Preenche o modal-title-wrap unificado (substituindo completamente info-card e cardCategory)
        document.getElementById('modalStreetTag').textContent = (customTag || 'DIAGNÓSTICO DE IMPACTO NEGATIVO • VOTAÇÃO NA CÂMARA').toUpperCase();
        document.getElementById('modalStreetTitle').textContent = bairro && !bairro.includes('hectares') ? `${name} • ${bairro}` : name;
        document.getElementById('modalStreetMeta').innerHTML = `
            <span>📍 Hoje (2006): <strong>${z06Name}</strong></span>
            <span>➔</span>
            <span>⚠️ Minuta (2026): <strong style="color:#fca5a5;">${z26Name}</strong></span>
            ${areaHa ? `<span>• 📏 <strong>${Math.round(areaHa).toLocaleString('pt-BR')} ha</strong></span>` : ''}
        `;

        // Síntese de Impacto Negativo da Zona no Topo do Modal-Card
        let leadImpactHtml = customLeadBoxHtml || '';
        if (!leadImpactHtml) {
            let leadSummary = 'A minuta altera os parâmetros urbanísticos desta área sem estudo prévio de capacidade de água, esgoto e tráfego.';
            if (n26.includes('rural') || n06.includes('rural')) {
                leadSummary = '<strong>Desruralização e Pressão Imobiliária (-1.670,71 ha rurais na cidade):</strong> Sítios e áreas verdes estão sendo encolhidos para dar lugar a loteamentos fechados e adensamento, elevando o custo tributário (conversão de ITR em IPTU urbano) sem contrapartida de saneamento.';
            } else if (n26.includes('turístic') || n26.includes('turistico')) {
                leadSummary = '<strong>Expansão de Condomínios em Áreas Sensíveis (+1.935,95 ha):</strong> A Zona de Interesse Turístico cresceu 27,4% avançando sobre fragmentos de Mata Atlântica e cabeceiras de drenagem, permitindo prédios de até 18m (6 andares) e loteamentos onde não há rede da Sabesp.';
            } else if (n26.includes('média') || n26.includes('media')) {
                leadSummary = '<strong>Adensamento Agressivo (+139,3% de área):</strong> A zona de Média Densidade mais que dobrou na minuta, liberando prédios de 21 metros (7 andares) e 70% de concreto no terreno (apenas 20% permeável), agravando enxurradas, trânsito e falta de pressão d\'água.';
            } else if (n26.includes('estratégica') || n26.includes('zucaer') || n26.includes('desenvolvimento econômico')) {
                leadSummary = '<strong>Assimetria Corporativa e Verticalização (30m a 100m):</strong> Libera gabarito elevado e 60% de ocupação em grandes glebas corporativas sem rede pública de esgoto, enquanto propriedades vizinhas sofrem restrições aeronáuticas (PBZPA/DECEA raio 10 km).';
            } else if (n26.includes('manancial') || n26.includes('zupa')) {
                leadSummary = '<strong>Risco aos Mananciais de Água Potável:</strong> Área crítica de recarga hídrica (Bacia do Sorocamirim / APA Itupararanga) submetida à pressão de parcelamentos do solo e exceções para loteamentos fechados (Art. 36, § 1º da Minuta LC 40).';
            }

            leadImpactHtml = `
                <div class="negative-impact-lead">
                    <div class="negative-impact-lead-header">
                        <span class="negative-impact-lead-title">
                            <i data-lucide="alert-triangle" style="width: 17px; height: 17px; color: #ef4444;"></i>
                            IMPACTO NEGATIVO DIRETO DESTA ZONA
                        </span>
                        <span class="citizen-badge critico">ALERTA LEGISLATIVO</span>
                    </div>
                    <div class="negative-impact-lead-body">${leadSummary}</div>
                    <div class="negative-metrics-strip">
                        <div class="negative-metric-box">
                            <span>Altura Máxima (2026)</span>
                            <strong>${spec26.gabarito}</strong>
                        </div>
                        <div class="negative-metric-box">
                            <span>Concreto no Lote (TO)</span>
                            <strong>Até ${spec26.to} impermeável</strong>
                        </div>
                        <div class="negative-metric-box">
                            <span>Como é Hoje (2006)</span>
                            <strong>${spec06.gabarito} (TO ${spec06.to})</strong>
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
            <div class="spot-zoning-card" style="background: rgba(239, 68, 68, 0.08); border: 2px solid #ef4444; border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                    <span style="font-size: 12.5px; font-weight: 900; color: #fca5a5; display: flex; align-items: center; gap: 6px;">
                        <i data-lucide="shield-alert" style="width: 17px; height: 17px; color: #ef4444;"></i>
                        SPOT ZONING DETECTADO: PRIVILÉGIO PONTUAL
                    </span>
                    <span style="background: #ef4444; color: #fff; font-size: 10.5px; font-weight: 900; padding: 2px 8px; border-radius: 999px;">
                        SCORE ${spotScore}/100 • ${spotNivel.toUpperCase()}
                    </span>
                </div>
                <div style="background: rgba(0,0,0,0.35); border-left: 3px solid #ef4444; border-radius: 6px; padding: 8px 10px; font-size: 11.5px; color: #f1f5f9; line-height: 1.45;">
                    <strong>Diagnóstico Pericial:</strong> ${spotDiag} (Ilhamento: <strong>${spotIlha}%</strong> • Salto de Gabarito: <strong>+${spotDelta}m</strong>).
                </div>
            </div>`;
        }

        // 1. IMPACTO NO BOLSO: IPTU E TAXAS
        let d1CardStyle = 'border: 1px solid rgba(245, 158, 11, 0.45); background: rgba(245, 158, 11, 0.06);';
        let d1Title = '1. Impacto no Bolso: Pressão de IPTU e Custo de Vida';
        let d1Icon = '<i data-lucide="dollar-sign" style="color:#f59e0b;width:16px;height:16px;"></i>';
        let d1Badge = 'PRESSÃO FISCAL';
        let d1Class = 'alerta';
        let d1BodyText = 'A ampliação de potencial construtivo eleva o valor especulativo do metro quadrado, pressionando a Planta Genérica de Valores e o IPTU cobrado dos moradores tradicionais.';
        let d1AlertHtml = '';

        if (n06.includes('rural') && !n26.includes('rural')) {
            d1CardStyle = 'border: 1px solid rgba(239, 68, 68, 0.55); background: rgba(239, 68, 68, 0.09);';
            d1Title = '1. Impacto no Bolso: Conversão de ITR Barato em IPTU Urbano Caro';
            d1Icon = '<i data-lucide="alert-octagon" style="color:#ef4444;width:16px;height:16px;"></i>';
            d1Badge = 'ALTO IMPACTO NO BOLSO';
            d1Class = 'critico';
            d1BodyText = 'Sítios e chácaras perdem o enquadramento rural (ITR federal) e passam a receber <strong>carnê de IPTU urbano + taxas municipais</strong>, multiplicando o custo anual mesmo em ruas de terra sem esgoto.';
            d1AlertHtml = '<div class="citizen-alert-box"><strong>⚠️ Expulsão Indireta:</strong> O encarecimento tributário força pequenos proprietários e produtores familiares a venderem suas terras para loteadoras.</div>';
        }

        // 2. ÁGUA E ESGOTO NA SUA TORNEIRA
        let d2Badge = 'DÉFICIT SABESP (47,8%)', d2Class = 'alerta', d2Text = '', d2Alert = '';
        if (n26.includes('manancial') || locName.includes('carmo') || locName.includes('canguera') || locName.includes('vinho')) {
            d2Badge = 'RISCO HÍDRICO CRÍTICO'; d2Class = 'critico';
            d2Text = 'Região desprovida de rede coletora de esgoto da Sabesp. Novos condomínios perfuram poços profundos que rebaixam o lençol freático e multiplicam fossas sépticas sobre áreas de recarga de mananciais.';
            d2Alert = '⚠️ Alerta Técnico: Risco concreto de seca de poços rasos na estiagem e contaminação das águas da Bacia do Sorocamirim / Itupararanga.';
        } else if (n26.includes('média') || n26.includes('media') || locName.includes('mailasqui') || locName.includes('são joão')) {
            d2Badge = 'REDE NO LIMITE'; d2Class = 'critico';
            d2Text = 'São Roque trata apenas 47,8% do esgoto (SNIS/ARSESP — objeto do Inquérito Civil MPSP nº 0439.0000192/2025). Autorizar prédios de 7 andares sem ampliar antes as ETEs agrava a falta d\'água no verão e o despejo nos córregos.';
            d2Alert = '⚠️ Risco de desabastecimento nos pontos altos e sobrecarga de esgoto in natura.';
        } else {
            d2Text = 'Segundo dados oficiais do SNIS/ARSESP, mais da metade do esgoto do município não recebe tratamento adequado. O adensamento proposto não exige certidão prévia de capacidade instalada.';
            d2Alert = '⚠️ Ausência de trava legal que condicione novos prédios à entrega de obras de saneamento.';
        }

        // 3. VIZINHOS E O QUE PODEM CONSTRUIR NA SUA CERCA
        let d3Badge = 'IMPACTO DE VIZINHANÇA', d3Class = 'alerta', d3Text = '';
        if (n26.includes('estratégica')) {
            d3Badge = 'ATÉ 30m / 100m DE ALTURA'; d3Class = 'critico';
            d3Text = 'Autoriza edificações de até 100m em lote (30m / 10 andares em gleba) e 60% de solo impermeabilizado, criando forte assimetria frente aos sítios do entorno restritos pelo cone do aeroporto.';
        } else if (n26.includes('média') || n26.includes('media')) {
            d3Badge = 'PRÉDIOS DE 7 ANDARES (21m)'; d3Class = 'critico';
            d3Text = 'Permite erguer espigões de 21 metros (7 pavimentos) ao lado de casas térreas, com 70% do terreno coberto por concreto (apenas 20% permeável), gerando sombreamento, perda de ventilação e perda total de privacidade.';
        } else if (n26.includes('turístic') || n26.includes('turistico')) {
            d3Badge = 'CONDOMÍNIOS E 6 ANDARES (18m)'; d3Class = 'alerta';
            d3Text = 'Libera condomínios horizontais fechados e edificações de até 18 metros (6 andares) em áreas de transição rural e corredores ecológicos.';
        } else if (n26.includes('alta') || n26.includes('central')) {
            d3Badge = 'VERTICALIZAÇÃO (21m A 30m)'; d3Class = 'critico';
            d3Text = 'Permite prédios de até 30 metros (10 andares) e impermeabilização de até 80% do lote no centro, saturando a infraestrutura urbana antiga.';
        } else {
            d3Text = `Parâmetros propostos na minuta: Altura máxima de ${spec26.gabarito} e Taxa de Ocupação de ${spec26.to}.`;
        }

        // 4. TRÂNSITO, POEIRA E BARULHO NA SUA RUA
        let d4Badge = 'SOBRECARGA VIÁRIA', d4Class = 'alerta', d4Text = '';
        if (locName.includes('carmo') || locName.includes('vinho') || locName.includes('canguera') || locName.includes('candor')) {
            d4Badge = 'VIAS RURAIS COLAPSADAS'; d4Class = 'critico';
            d4Text = 'Estradas vicinais estreitas e sem acostamento receberão tráfego intenso de caminhões basculantes, betoneiras de obras e milhares de novos veículos de condomínios.';
        } else if (locName.includes('mailasqui') || locName.includes('raposo') || locName.includes('são joão')) {
            d4Badge = 'GARGALO NA RAPOSO TAVARES'; d4Class = 'critico';
            d4Text = 'Aumento severo do tempo de deslocamento diário na SP-270 (Raposo Tavares), sem duplicação de acessos locais nem passarelas seguras para pedestres.';
        } else {
            d4Text = 'A multiplicação de apartamentos em ruas estreitas sem recuo viário adequado trava o trânsito local, elimina vagas e eleva a poluição sonora.';
        }

        // 5. CHUVA, ENCOSTAS E RISCO GEOLÓGICO (CPRM)
        let d5Badge = 'DRENAGEM & ENCOSTAS', d5Class = 'alerta', d5Text = '', d5Alert = '';
        if (locName.includes('junqueira') || locName.includes('goianã') || locName.includes('vinhedos') || locName.includes('mosteiro') || locName.includes('cambará')) {
            d5Badge = 'RISCO ALTO (R3/R4) CPRM'; d5Class = 'critico';
            d5Text = 'Mapeamento oficial do Serviço Geológico do Brasil (SGB/CPRM 2023): Setores com risco alto e muito alto de escorregamento de encosta. Impermeabilizar até 70% do solo a montante multiplica a força das enxurradas sobre as moradias.';
            d5Alert = '⚠️ Perigo à Vida (Lei Federal 12.608/2012): Adensar encostas instáveis sem macrodrenagem prévia viola as diretrizes nacionais de prevenção de desastres.';
        } else if (locName.includes('carmo') || locName.includes('aracaí') || locName.includes('guaçu') || locName.includes('centro')) {
            d5Badge = 'RISCO DE INUNDAÇÃO (CPRM)'; d5Class = 'critico';
            d5Text = 'Planícies fluviais e fundos de vale sujeitos a transbordamentos rápidos. A redução da taxa de permeabilidade para 10%-20% nas zonas urbanas acelera o pico de cheia nos rios Aracaí, Carambeí e Sorocamirim.';
            d5Alert = '⚠️ Alerta de Enchente: Mais concreto nas áreas altas significa mais água invadindo as partes baixas da cidade.';
        } else {
            d5Text = 'A redução de áreas permeáveis prevista nos Anexos I e VI da Minuta da LC 40/2026 diminui a infiltração da chuva no solo e sobrecarrega galerias pluviais.';
        }

        // 6. ASSIMETRIA TEMPORAL: PRIVILÉGIO IMEDIATO vs OBRAS SÓ NO PAPEL
        let obrasLista = 'Parques lineares, ciclovias e diretrizes de mobilidade e saneamento.';
        if (locName.includes('mailasqui') || locName.includes('são joão')) {
            obrasLista = 'Plano Viário de Mailasqui, Parque da Estação e ampliação de rede coletora.';
        } else if (locName.includes('carmo') || locName.includes('canguera')) {
            obrasLista = 'Parque dos Alagados do Carmo e programas de saneamento rural.';
        }

        const html = `
            ${leadImpactHtml}
            ${spotZoningBox}

            <div class="citizen-section-title" style="margin-top: 6px;">
                <i data-lucide="flame" style="width:15px;height:15px;color:#ef4444;"></i>
                <span>6 Impactos Negativos Concretos na Sua Vida e no Seu Bairro</span>
            </div>

            <div class="citizen-grid">
                <div class="citizen-card" style="${d1CardStyle}">
                    <div class="citizen-card-header">
                        <span class="citizen-card-title">${d1Icon} ${d1Title}</span>
                        <span class="citizen-badge ${d1Class}">${d1Badge}</span>
                    </div>
                    <div class="citizen-card-body" style="color: #f1f5f9;">${d1BodyText}</div>
                    ${d1AlertHtml}
                </div>

                <div class="citizen-card">
                    <div class="citizen-card-header">
                        <span class="citizen-card-title"><i data-lucide="droplets" style="color:#06b6d4;width:15px;height:15px;"></i> 2. Água e Esgoto na sua Torneira</span>
                        <span class="citizen-badge ${d2Class}">${d2Badge}</span>
                    </div>
                    <div class="citizen-card-body">${d2Text}</div>
                    ${d2Alert ? `<div class="citizen-alert-box">${d2Alert}</div>` : ''}
                </div>

                <div class="citizen-card">
                    <div class="citizen-card-header">
                        <span class="citizen-card-title"><i data-lucide="building-2" style="color:#3b82f6;width:15px;height:15px;"></i> 3. O que Podem Construir na sua Cerca</span>
                        <span class="citizen-badge ${d3Class}">${d3Badge}</span>
                    </div>
                    <div class="citizen-card-body">${d3Text}</div>
                </div>

                <div class="citizen-card">
                    <div class="citizen-card-header">
                        <span class="citizen-card-title"><i data-lucide="truck" style="color:#f59e0b;width:15px;height:15px;"></i> 4. Trânsito, Caminhões e Barulho</span>
                        <span class="citizen-badge ${d4Class}">${d4Badge}</span>
                    </div>
                    <div class="citizen-card-body">${d4Text}</div>
                </div>

                <div class="citizen-card">
                    <div class="citizen-card-header">
                        <span class="citizen-card-title"><i data-lucide="alert-triangle" style="color:#ef4444;width:15px;height:15px;"></i> 5. Chuvas, Enchentes e Encostas (CPRM)</span>
                        <span class="citizen-badge ${d5Class}">${d5Badge}</span>
                    </div>
                    <div class="citizen-card-body">${d5Text}</div>
                    ${d5Alert ? `<div class="citizen-alert-box">${d5Alert}</div>` : ''}
                </div>

                <div class="citizen-card" style="border-color: rgba(168, 85, 247, 0.45); background: rgba(168, 85, 247, 0.05);">
                    <div class="citizen-card-header">
                        <span class="citizen-card-title"><i data-lucide="scale" style="color:#a855f7;width:15px;height:15px;"></i> 6. Assimetria: Prédios Imediatos vs. Obras Só no Papel</span>
                        <span class="citizen-badge promessa">SEM VERBA VINCULADA</span>
                    </div>
                    <div class="citizen-card-body">
                        <strong>Promessa na Minuta:</strong> ${obrasLista}
                    </div>
                    <div class="citizen-asymmetry-box">
                        <strong>⚖️ Por que você precisa agir antes da votação:</strong> A liberação para construtoras e loteadoras vale <strong>no dia seguinte à aprovação da lei na Câmara</strong>. Já as obras públicas prometidas <strong>não possuem data, projeto executivo nem orçamento carimbado no PPA</strong>. O impacto negativo chega imediatamente; a infraestrutura fica só na promessa.
                    </div>
                </div>
            </div>

            ${this.renderInlinePetitionButton(AppState.currentInspectedNeighborhood)}
        `;

        document.getElementById('modalStreetBody').innerHTML = html;
        streetModal.classList.add('visible');
        lucide.createIcons();
    }
};

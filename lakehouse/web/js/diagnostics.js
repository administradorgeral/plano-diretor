/* ==========================================================================
   4. DIAGNOSTICS.JS — Point-in-Polygon, Cards de Zona, Spot Zoning e Raio-X (6 Dimensões)
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
        const count = window.AppPetition ? AppPetition.getTotalCount() : AppConfig.PETITION.BASE_VERIFIED_COUNT;
        const safeZone = (contextZone || '').replace(/"/g, '&quot;');
        return `
            <button type="button" class="btn-petition" onclick="AppPetition.openModal('${safeZone}')" style="margin-top: 8px; justify-content: center; width: 100%; font-size: 12px; height: 40px;">
                <span class="petition-chevron">&gt;</span>
                <span>Crescer exige responsabilidade!</span>
                <span class="petition-counter-pill" data-petition-count>${count.toLocaleString('pt-BR')} assinaturas</span>
            </button>
        `;
    },

    showPointCard: function (props, categoryLabel) {
        const infoCard = document.getElementById('infoCard');
        document.getElementById('cardCategory').textContent = (props.categoria || categoryLabel).toUpperCase();
        document.getElementById('cardTitle').textContent = props.titulo;
        document.getElementById('cardDesc').textContent = props.resumo;
        document.getElementById('cardMeta').style.display = 'none';
        infoCard.style.display = 'flex';
    },

    showZoneCard: function (props, timeLabel, layer) {
        const infoCard = document.getElementById('infoCard');
        document.getElementById('cardCategory').textContent = timeLabel.toUpperCase();
        document.getElementById('cardTitle').textContent = props.nome_zona || 'Zona Urbanística';

        let center = null;
        if (layer && typeof layer.getBounds === 'function') {
            center = layer.getBounds().getCenter();
        } else {
            center = AppState.map.getCenter();
        }
        AppState.lastSelectedZone = { props: props, center: center, timeLabel: timeLabel };
        AppState.currentInspectedNeighborhood = props.nome_zona || '';

        const n = (props.nome_zona || '').toLowerCase();
        let desc = props.descricao_limpa || 'Área regulada pelas diretrizes de uso do solo da cidade.';

        if (n.includes('rural')) {
            desc = 'Zona Rural: a proposta elimina 1.670 campos de futebol de área verde para transformar em expansão urbana e condomínios.';
        } else if (n.includes('turístic') || n.includes('turistico')) {
            desc = 'Zona de Interesse Turístico: expandiu quase 2.000 hectares (+27%), facilitando condomínios fechados em áreas de mata.';
        } else if (n.includes('estratégica') || n.includes('zucaer')) {
            desc = 'Complexo Catarina: permite prédios de 10 andares (30m), enquanto os sítios vizinhos sofrem restrição de altura pelo aeroporto.';
        } else if (n.includes('média') || n.includes('media')) {
            desc = 'Bairros de Média Densidade: mais que dobrou de tamanho (+139%) sem garantia de rede de esgoto e água tratada.';
        }

        document.getElementById('cardDesc').textContent = desc;

        const meta = document.getElementById('cardMeta');
        if (props.area_ha) {
            meta.style.display = 'flex';
            document.getElementById('cardMetaArea').textContent = `Tamanho: ${Math.round(props.area_ha).toLocaleString('pt-BR')} hectares`;
            document.getElementById('cardMetaRegime').textContent = timeLabel;
        } else {
            meta.style.display = 'none';
        }

        infoCard.style.display = 'flex';
    },

    showSpotZoningCard: function (props, layer) {
        const infoCard = document.getElementById('infoCard');
        const streetModal = document.getElementById('streetModal');
        const isSpot = (props.score_spot_zoning >= 35) || props.is_spot_zoning;

        if (!isSpot) {
            if (infoCard) infoCard.style.display = 'none';
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

        document.getElementById('modalStreetTitle').textContent = `${props.nome_zona || 'Área Auditada'}`;

        const score = props.score_spot_zoning || 0;
        const nivel = (props.nivel_spot_zoning || 'Moderado').toUpperCase();
        const diag = props.diagnostico || 'Área com índices urbanísticos sob medida que destoam de todo o entorno.';
        const ilha = Math.round((props.i_ilha || 0) * 100);
        const deltaGab = props.delta_gab_m || 0;

        const html = `
            <div class="spot-zoning-card" style="background: rgba(239, 68, 68, 0.08); border: 2px solid #ef4444; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                    <span style="font-size: 13px; font-weight: 900; color: #fca5a5; display: flex; align-items: center; gap: 6px;">
                        <i data-lucide="shield-alert" style="width: 18px; height: 18px; color: #ef4444;"></i>
                        SPOT ZONING DETECTADO: PRIVILÉGIO PONTUAL
                    </span>
                    <span style="background: #ef4444; color: #fff; font-size: 11px; font-weight: 900; padding: 3px 10px; border-radius: 999px;">
                        SCORE ${score}/100 • ${nivel}
                    </span>
                </div>

                <p style="font-size: 13px; color: #f1f5f9; line-height: 1.5; margin: 0;">
                    <strong>O que significa para o cidadão:</strong> Esta área recebeu <strong>regras de exceção criadas sob medida</strong> que autorizam empreendimentos pontuais a erguer prédios muito mais altos e concretar o solo muito mais do que os terrenos e sítios vizinhos.
                </p>

                <div style="background: rgba(0,0,0,0.45); border-left: 3px solid #ef4444; border-radius: 6px; padding: 10px 12px; font-size: 12px; color: #f8fafc; line-height: 1.5;">
                    <strong>Impacto Real:</strong> ${diag}
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 8px 10px; border-radius: 8px; font-size: 11.5px;">
                        <span style="color: var(--text-muted);">Ilhamento Territorial:</span><br>
                        <strong style="color: #f87171; font-size: 13px;">${ilha}% de divisa com zona comum</strong>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 8px 10px; border-radius: 8px; font-size: 11.5px;">
                        <span style="color: var(--text-muted);">Salto de Altura:</span><br>
                        <strong style="color: #f87171; font-size: 13px;">+${deltaGab}m acima do entorno</strong>
                    </div>
                </div>

                ${this.renderInlinePetitionButton(props.nome_zona)}
            </div>
        `;

        document.getElementById('modalStreetBody').innerHTML = html;
        streetModal.classList.add('visible');
        lucide.createIcons();
    },

    showStreetImpactModal: function (name, bairro, lat, lng, customProps) {
        const bundle = AppState.bundle;
        const streetModal = document.getElementById('streetModal');
        const infoCard = document.getElementById('infoCard');

        AppState.currentInspectedNeighborhood = `${name} (${bairro})`;

        const z06Props = this.findZoneForCoord(lng, lat, bundle.zoneamento_2006);
        let z26Props = customProps || this.findZoneForCoord(lng, lat, bundle.zoneamento_2026);

        let szProps = (customProps && customProps.score_spot_zoning !== undefined)
            ? customProps
            : this.findZoneForCoord(lng, lat, bundle.spot_zoning);

        if (!szProps && z26Props && bundle.spot_zoning && bundle.spot_zoning.features) {
            const matchFeat = bundle.spot_zoning.features.find(f => f.properties.nome_zona === z26Props.nome_zona);
            if (matchFeat) szProps = matchFeat.properties;
        }

        const z06Name = z06Props ? z06Props.nome_zona : (customProps ? customProps.nome_zona : 'Zona Não Mapeada');
        const z26Name = z26Props ? z26Props.nome_zona : 'Zona Não Mapeada';

        const n26 = z26Name.toLowerCase();
        const n06 = z06Name.toLowerCase();
        const locName = (name + ' ' + bairro).toLowerCase();

        const isSpotZoning = szProps && (szProps.score_spot_zoning >= 35 || szProps.is_spot_zoning);

        if (AppState.mode === 'spot_zoning') {
            if (!isSpotZoning) {
                if (streetModal) streetModal.classList.remove('visible');
                if (infoCard) infoCard.style.display = 'none';
                return;
            }
            this.showSpotZoningCard(szProps, null);
            return;
        }

        document.getElementById('modalStreetTitle').textContent = `${name} • ${bairro}`;

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
                    <span style="font-size: 13px; font-weight: 900; color: #fca5a5; display: flex; align-items: center; gap: 6px;">
                        <i data-lucide="shield-alert" style="width: 17px; height: 17px; color: #ef4444;"></i>
                        SPOT ZONING DETECTADO: PRIVILÉGIO PONTUAL
                    </span>
                    <span style="background: #ef4444; color: #fff; font-size: 11px; font-weight: 900; padding: 2px 8px; border-radius: 999px;">
                        SCORE ${spotScore}/100 • ${spotNivel.toUpperCase()}
                    </span>
                </div>
                <p style="font-size: 12.5px; color: #f1f5f9; line-height: 1.5; margin: 0;">
                    <strong>O que significa na prática:</strong> Esta área recebeu <strong>regras de exceção criadas sob medida</strong> que autorizam grandes empreendimentos a construir muito mais alto e concretar muito mais do que os terrenos e sítios vizinhos.
                </p>
                <div style="background: rgba(0,0,0,0.35); border-left: 3px solid #ef4444; border-radius: 6px; padding: 8px 10px; font-size: 11.5px; color: #cbd5e1; line-height: 1.45;">
                    <strong>Impacto Real:</strong> ${spotDiag}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 2px;">
                    <div style="background: rgba(255,255,255,0.04); padding: 6px 8px; border-radius: 6px; font-size: 11px;">
                        <span style="color: var(--text-muted);">Ilhamento Territorial:</span><br>
                        <strong style="color: #f87171;">${spotIlha}% de divisa com zona diferente</strong>
                    </div>
                    <div style="background: rgba(255,255,255,0.04); padding: 6px 8px; border-radius: 6px; font-size: 11px;">
                        <span style="color: var(--text-muted);">Salto de Altura:</span><br>
                        <strong style="color: #f87171;">+${spotDelta}m acima do entorno</strong>
                    </div>
                </div>
                ${this.renderInlinePetitionButton(`${name} (${bairro})`)}
            </div>`;
        }

        // 1. IMPACTO NO BOLSO: IPTU E TAXAS
        let d1CardStyle = 'border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.03);';
        let d1Title = '1. Impacto no Bolso: IPTU e Taxas Municipais';
        let d1Icon = '<i data-lucide="file-text" style="color:#94a3b8;width:16px;height:16px;"></i>';
        let d1Badge = 'REGIME REGULAR';
        let d1Class = 'atencao';
        let d1BodyText = 'Mantém as regras gerais de tributação imobiliária municipal sem alteração imediata de enquadramento.';
        let d1AlertHtml = '';

        if (n06.includes('rural') && !n26.includes('rural')) {
            d1CardStyle = 'border: 1px solid rgba(239, 68, 68, 0.5); background: rgba(239, 68, 68, 0.08);';
            d1Title = '1. Impacto no Bolso: Risco de IPTU Urbano Muito Mais Caro';
            d1Icon = '<i data-lucide="alert-octagon" style="color:#ef4444;width:16px;height:16px;"></i>';
            d1Badge = 'RISCO NO BOLSO';
            d1Class = 'critico';
            d1BodyText = 'Seu sítio ou chácara sai do regime rural (ITR, mais barato) e passa a pagar <strong>IPTU municipal com taxa de coleta de lixo</strong>. O imposto anual pode multiplicar várias vezes para quem tem terra na região.';
            d1AlertHtml = '<div class="citizen-alert-box" style="background: rgba(239, 68, 68, 0.15); border-left-color: #ef4444; color: #fca5a5;"><strong>⚠️ Risco Financeiro:</strong> A perda do enquadramento rural pressiona os pequenos proprietários a vender suas terras para loteadoras.</div>';
        } else if (n26.includes('média') || n26.includes('media') || n26.includes('estratégica') || n26.includes('alta')) {
            d1CardStyle = 'border: 1px solid rgba(245, 158, 11, 0.45); background: rgba(245, 158, 11, 0.06);';
            d1Title = '1. Impacto no Bolso: Aumento no Custo de Vida e IPTU';
            d1Icon = '<i data-lucide="dollar-sign" style="color:#f59e0b;width:16px;height:16px;"></i>';
            d1Badge = 'PRESSÃO DE CUSTO';
            d1Class = 'alerta';
            d1BodyText = 'A liberação de prédios atrai especulação e eleva o valor do metro quadrado, puxando para cima a Planta Genérica de Valores e o IPTU cobrado da vizinhança.';
        }

        // 2. ÁGUA E ESGOTO NA SUA TORNEIRA
        let d2Badge = 'ATENÇÃO', d2Class = 'atencao', d2Text = '', d2Alert = '';
        if (n26.includes('manancial') || locName.includes('carmo') || locName.includes('canguera') || locName.includes('vinho')) {
            d2Badge = 'RISCO CRÍTICO'; d2Class = 'critico';
            d2Text = 'Não existe rede de esgoto da Sabesp. O adensamento com novos condomínios e chácaras aumenta a disputa por poços artesianos e satura o lençol freático com fossas sépticas.';
            d2Alert = '⚠️ Alerta: Risco real de falta d água na estiagem e contaminação de poços artesianos.';
        } else if (n26.includes('média') || n26.includes('media') || locName.includes('mailasqui') || locName.includes('são joão')) {
            d2Badge = 'ESGOTO NO LIMITE'; d2Class = 'alerta';
            d2Text = 'A rede coletora de esgoto e as Estações de Tratamento locais já operam no limite. A chegada de novos prédios causa risco de retorno de esgoto no ralo na chuva e falta de pressão d água no verão.';
            d2Alert = '⚠️ Risco de baixa pressão crônica na rede de água no verão.';
        } else if (n26.includes('estratégica') || locName.includes('catarina')) {
            d2Badge = 'SISTEMA PRIVADO'; d2Class = 'atencao';
            d2Text = 'O polo corporativo e aeroportuário opera com tratamento próprio e poços profundos, captando grande volume do aquífero regional.';
        } else {
            d2Badge = 'REGULAR'; d2Class = 'atencao';
            d2Text = 'Região atendida pela malha básica, mas que requer monitoramento de vazão frente ao aumento de apartamentos.';
        }

        // 3. VIZINHOS E O QUE PODEM CONSTRUIR NA SUA CERCA
        let d3Badge = 'PERMISSÃO EDILÍCIA', d3Class = 'atencao', d3Text = '';
        if (n26.includes('estratégica')) {
            d3Badge = 'VERTICALIZAÇÃO MÁXIMA'; d3Class = 'critico';
            d3Text = 'Autorizado gabarito de até 100 metros em lote (ou 30 metros / 10 andares em gleba) com 60% de concreto no chão. Os sítios vizinhos continuam restritos pelo cone do aeroporto.';
        } else if (n26.includes('média') || n26.includes('media')) {
            d3Badge = 'PRÉDIOS DE 7 ANDARES'; d3Class = 'alerta';
            d3Text = 'Autorizados prédios de até 21 metros (7 andares), lotes pequenos de 250 m² e até 70% de concreto no terreno. Perda de privacidade e sombra no seu quintal.';
        } else if (n26.includes('turístic') || n26.includes('turistico')) {
            d3Badge = 'CONDOMÍNIOS HORIZONTAIS'; d3Class = 'alerta';
            d3Text = 'Permite loteamentos fechados de alto padrão e prédios de até 6 andares (18m) em áreas que antes eram exclusivamente rurais e de mata.';
        } else if (n26.includes('alta densidade') || n26.includes('central')) {
            d3Badge = 'ALTA DENSIDADE'; d3Class = 'alerta';
            d3Text = 'Permite prédios de 8 a 10 andares (24m a 30m) com alta taxa de ocupação do lote.';
        } else if (n26.includes('rural')) {
            d3Badge = 'ZONA RURAL'; d3Class = 'atencao';
            d3Text = 'Preservação de chácaras e sítios: lote mínimo de 20.000 m² (módulo INCRA), casas térreas ou de 2 andares (máximo 9m). Proibido prédios.';
        } else {
            d3Text = 'Regras de ocupação padrão para a categoria da zona na minuta.';
        }

        // 4. TRÂNSITO, POEIRA E BARULHO NA SUA RUA
        let d4Badge = 'FLUXO LOCAL', d4Class = 'atencao', d4Text = '';
        if (locName.includes('catarina') || locName.includes('castello')) {
            d4Badge = 'TRÁFEGO PESADO E JATOS'; d4Class = 'alerta';
            d4Text = 'Ruído de turbinas de jatos executivos pousando no aeroporto SBJH e circulação pesada de carretas de logística na rodovia.';
        } else if (locName.includes('carmo') || locName.includes('vinho') || locName.includes('canguera') || locName.includes('candor')) {
            d4Badge = 'ESTRADAS TRAVADAS'; d4Class = 'critico';
            d4Text = 'Estradas estreitas de terra recebendo caminhões pesados de terraplanagem, caminhões-betoneira e centenas de novos veículos de condomínios.';
        } else if (locName.includes('mailasqui') || locName.includes('raposo')) {
            d4Badge = 'GARGALO RODOVIÁRIO'; d4Class = 'critico';
            d4Text = 'Congestionamento crônico na Rodovia Raposo Tavares, carência de passarelas seguras e travessias perigosas de pedestres.';
        } else {
            d4Badge = 'TRÂNSITO URBANO'; d4Class = 'atencao';
            d4Text = 'Aumento de carros particulares e entregas circulando nas ruas do bairro com o desmembramento de lotes.';
        }

        // 5. CHUVA, ENCOSTAS E RISCO GEOLÓGICO (CPRM)
        let d5Badge = 'SEM RISCO CRÍTICO', d5Class = 'atencao', d5Text = '', d5Alert = '';
        if (locName.includes('junqueira') || locName.includes('goianã') || locName.includes('vinhedos') || locName.includes('mosteiro')) {
            d5Badge = 'RISCO ALTO (R3) DE DESLIZAMENTO'; d5Class = 'critico';
            d5Text = 'Mapeamento oficial CPRM/SGB: Morros com alto risco de escorregamento de encosta. O excesso de concreto no topo agrava a descida de enxurrada na sua casa.';
            d5Alert = '⚠️ Alerta CPRM: A impermeabilização do topo do morro agrava a instabilidade das encostas vizinhas.';
        } else if (locName.includes('carmo') || locName.includes('vila do carmo')) {
            d5Badge = 'RISCO DE INUNDAÇÃO'; d5Class = 'critico';
            d5Text = 'Mapeamento CPRM: Várzea do rio sujeita a alagamentos rápidos e refluxo de água durante tempestades de verão.';
            d5Alert = '⚠️ Alerta de Inundação: Áreas ribeirinhas vulneráveis ao aumento do escoamento superficial provocado por condomínios a montante.';
        } else {
            d5Badge = 'MONITORAMENTO'; d5Class = 'atencao';
            d5Text = 'A impermeabilização cumulativa por concreto reduz a absorção da água da chuva e acelera as enxurradas nas ruas.';
        }

        // 6. OBRAS PROMETIDAS PELA PREFEITURA
        let obrasLista = 'Implantação de parques lineares, ciclovias e melhorias em corredores de transporte coletivo.';
        if (locName.includes('mailasqui') || locName.includes('são joão')) {
            obrasLista = 'Plano do Sistema Viário de Mailasqui, Parque da Estação Ferroviária e drenagem de córregos.';
        } else if (locName.includes('carmo') || locName.includes('canguera')) {
            obrasLista = 'Parque dos Alagados do Carmo, pavimentação seletiva de acessos turísticos e contenções de margem.';
        } else if (locName.includes('centro') || locName.includes('junqueira')) {
            obrasLista = 'Parque Linear da Vila Amaral, Parque Bernardino de Lucca e intervenções de drenagem na bacia central.';
        }

        const html = `
            ${spotZoningBox}

            <div class="citizen-section-title" style="margin-top: ${isSpotZoning ? '14px' : '4px'};">
                <i data-lucide="activity" style="width:14px;height:14px;"></i>
                <span>O Que Muda na Sua Vida (Impacto Real)</span>
            </div>

            <div class="citizen-grid">
                <div class="citizen-card" style="${d1CardStyle}">
                    <div class="citizen-card-header">
                        <span class="citizen-card-title">${d1Icon} ${d1Title}</span>
                        <span class="citizen-badge ${d1Class}">${d1Badge}</span>
                    </div>
                    <div class="citizen-card-body" style="font-size: 12.5px; color: #f1f5f9;">${d1BodyText}</div>
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
                        <span class="citizen-card-title"><i data-lucide="building-2" style="color:#3b82f6;width:15px;height:15px;"></i> 3. Vizinhos e o que Podem Construir na sua Cerca</span>
                        <span class="citizen-badge ${d3Class}">${d3Badge}</span>
                    </div>
                    <div class="citizen-card-body">${d3Text}</div>
                </div>

                <div class="citizen-card">
                    <div class="citizen-card-header">
                        <span class="citizen-card-title"><i data-lucide="truck" style="color:#f59e0b;width:15px;height:15px;"></i> 4. Trânsito, Poeira e Barulho na sua Rua</span>
                        <span class="citizen-badge ${d4Class}">${d4Badge}</span>
                    </div>
                    <div class="citizen-card-body">${d4Text}</div>
                </div>

                <div class="citizen-card">
                    <div class="citizen-card-header">
                        <span class="citizen-card-title"><i data-lucide="alert-triangle" style="color:#ef4444;width:15px;height:15px;"></i> 5. Chuva, Encostas e Risco de Desastre (CPRM)</span>
                        <span class="citizen-badge ${d5Class}">${d5Badge}</span>
                    </div>
                    <div class="citizen-card-body">${d5Text}</div>
                    ${d5Alert ? `<div class="citizen-alert-box">${d5Alert}</div>` : ''}
                </div>

                <div class="citizen-card" style="border-color: rgba(168, 85, 247, 0.35); background: rgba(168, 85, 247, 0.04);">
                    <div class="citizen-card-header">
                        <span class="citizen-card-title"><i data-lucide="hammer" style="color:#a855f7;width:15px;height:15px;"></i> 6. Obras Prometidas pela Prefeitura (e a Assimetria de Prazos)</span>
                        <span class="citizen-badge promessa">NO PAPEL</span>
                    </div>
                    <div class="citizen-card-body">
                        <strong>O que consta na Minuta:</strong> ${obrasLista}
                    </div>
                    <div class="citizen-asymmetry-box">
                        <strong>⚖️ Alerta de Assimetria Temporal:</strong> A autorização para construtoras e loteadores erguerem prédios e condomínios é <strong>imediata no dia seguinte à aprovação da lei</strong>. No entanto, as obras públicas prometidas (asfalto, parques, saneamento) <strong>não têm data de início, não possuem projeto executivo e não têm orçamento reservado no PPA</strong>. O cidadão recebe o impacto do adensamento anos antes (ou sem garantia) de receber as melhorias prometidas.
                    </div>
                </div>
            </div>

            <p style="font-size: 11px; color: var(--text-muted); line-height: 1.4; margin-top: 10px;">
                * Diagnóstico gerado por cruzamento pericial das Minutas das LCs nº 39 e 40/2006, Cartas de Zoneamento (2006 vs 2026), Mapeamento Geológico CPRM (2023) e Relatórios Oficiais da Sabesp/ARSESP.
            </p>
        `;

        document.getElementById('modalStreetBody').innerHTML = html;
        streetModal.classList.add('visible');
        lucide.createIcons();
    }
};

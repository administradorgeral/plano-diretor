/* ==========================================================================
   7. MAIN.JS — Inicialização Geral da Aplicação e Orquestração de Eventos
      (Removido info-card intermediário: foco total no modal-card)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // 1. Inicializa o Mapa e Camadas
    AppMap.init();

    // 2. Inicializa o Motor de Busca
    AppSearch.init();

    // 3. Inicializa o Módulo de Petição Pública ("Crescer exige responsabilidade!")
    AppPetition.init();

    // 4. Eventos do Alternador de Modo (Hoje vs Proposta vs Spot Zoning)
    document.querySelectorAll('.segment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.segment-btn').forEach(b => {
                b.classList.remove('active', 'pulse-hint');
            });
            btn.classList.add('active');
            AppMap.updateMapMode(btn.dataset.mode);
        });
    });

    // 5. Eventos do Modal-Card Único (#streetModal) e Modal de Metodologia (#infoModal)
    const streetModal = document.getElementById('streetModal');
    const infoModal = document.getElementById('infoModal');

    document.getElementById('btnCloseStreetModal').addEventListener('click', () => {
        streetModal.classList.remove('visible');
    });

    document.getElementById('btnModalExplore').addEventListener('click', () => {
        streetModal.classList.remove('visible');
    });

    streetModal.addEventListener('click', (e) => {
        if (e.target === streetModal) streetModal.classList.remove('visible');
    });

    // Modal de Metodologia Científica e Fontes
    const btnInfo = document.getElementById('btnInfo');
    const btnCloseInfoModal = document.getElementById('btnCloseInfoModal');
    const btnModalCloseInfo = document.getElementById('btnModalCloseInfo');

    if (btnInfo && infoModal) {
        btnInfo.addEventListener('click', () => {
            infoModal.classList.add('visible');
            lucide.createIcons();
        });
        if (btnCloseInfoModal) {
            btnCloseInfoModal.addEventListener('click', () => infoModal.classList.remove('visible'));
        }
        if (btnModalCloseInfo) {
            btnModalCloseInfo.addEventListener('click', () => infoModal.classList.remove('visible'));
        }
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) infoModal.classList.remove('visible');
        });
    }

    // Reenquadrar Mapa
    document.getElementById('btnRecenter').addEventListener('click', () => AppMap.recenter());

    // Botão de Raio-X no Topo Direito abre direto o Modal-Card da região centralizada
    const btnTopRaioX = document.getElementById('btnTopRaioX');
    if (btnTopRaioX) {
        btnTopRaioX.addEventListener('click', () => {
            if (AppState.lastSelectedZone) {
                const sel = AppState.lastSelectedZone;
                AppDiagnostics.showStreetImpactModal(sel.props.nome_zona, 'Região Selecionada', sel.center.lat, sel.center.lng, sel.props);
            } else {
                const center = AppState.map.getCenter();
                AppDiagnostics.showStreetImpactModal('Diagnóstico da Região Centralizada', 'São Roque', center.lat, center.lng);
            }
        });
    }

    // 6. Inicia no Modo Spot Zoning habilitado por padrão
    AppMap.updateMapMode('spot_zoning');
});

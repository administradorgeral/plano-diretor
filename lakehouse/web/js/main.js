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

    // Botão de Raio-X no Topo Direito reabre a Lâmina Cívica de Acolhimento a qualquer momento
    const btnTopRaioX = document.getElementById('btnTopRaioX');
    if (btnTopRaioX) {
        btnTopRaioX.addEventListener('click', () => {
            window.AppWelcomeSheet.show();
        });
    }

    // Toque no Banner Superior abre diretamente o Diagnóstico Pericial (Ergonomia Tátil)
    const impactBanner = document.getElementById('impactBanner');
    if (impactBanner) {
        impactBanner.addEventListener('click', () => {
            if (AppState.lastSelectedZone) {
                const sel = AppState.lastSelectedZone;
                AppDiagnostics.showStreetImpactModal(sel.props.nome_zona, 'Região Selecionada', sel.center.lat, sel.center.lng, sel.props);
            } else {
                const center = AppState.map.getCenter();
                AppDiagnostics.showStreetImpactModal('Diagnóstico Pericial • São Roque', 'Região Centralizada', center.lat, center.lng);
            }
        });
    }

    // 6. Inicia no Modo Spot Zoning habilitado por padrão
    AppMap.updateMapMode('spot_zoning');

    // 7. Lâmina Cívica de Acolhimento Mobile-First (Modelo 1: Apple Maps / Uber / Mobilização Direta)
    const welcomeSheet = document.getElementById('welcomeSheet');
    const welcomeSheetBackdrop = document.getElementById('welcomeSheetBackdrop');
    const btnSheetSign = document.getElementById('btnSheetSign');
    const btnSheetExplore = document.getElementById('btnSheetExplore');
    const btnDismissSheet = document.getElementById('btnDismissSheet');
    const sheetDragHandle = document.getElementById('sheetDragHandle');

    window.AppWelcomeSheet = {
        show() {
            if (welcomeSheet && welcomeSheetBackdrop) {
                welcomeSheet.classList.add('visible');
                welcomeSheetBackdrop.classList.add('visible');
                lucide.createIcons();
            }
        },
        hide() {
            if (welcomeSheet && welcomeSheetBackdrop) {
                welcomeSheet.classList.remove('visible');
                welcomeSheetBackdrop.classList.remove('visible');
            }
        }
    };

    if (btnSheetSign) {
        btnSheetSign.addEventListener('click', () => {
            window.AppWelcomeSheet.hide();
            AppPetition.openModal();
        });
    }

    if (btnSheetExplore) {
        btnSheetExplore.addEventListener('click', () => {
            window.AppWelcomeSheet.hide();
        });
    }

    if (btnDismissSheet) {
        btnDismissSheet.addEventListener('click', () => {
            window.AppWelcomeSheet.hide();
        });
    }

    if (welcomeSheetBackdrop) {
        welcomeSheetBackdrop.addEventListener('click', () => {
            window.AppWelcomeSheet.hide();
        });
    }

    if (sheetDragHandle) {
        sheetDragHandle.addEventListener('click', () => {
            window.AppWelcomeSheet.hide();
        });
    }

    // Gesto touch nativo para arrastar para baixo e recolher
    let touchStartY = 0;
    if (welcomeSheet) {
        welcomeSheet.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        welcomeSheet.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const diff = touchY - touchStartY;
            const sheetBody = welcomeSheet.querySelector('.sheet-body');
            if (diff > 70 && (!sheetBody || sheetBody.scrollTop <= 0)) {
                window.AppWelcomeSheet.hide();
            }
        }, { passive: true });
    }
});

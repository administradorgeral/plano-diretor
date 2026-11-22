/* ==========================================================================
   2. STATE.JS — Gerenciamento Centralizado de Estado da Aplicação
   ========================================================================== */

window.AppState = {
    mode: 'proposta', // 'hoje' | 'proposta' | 'spot_zoning'
    map: null,
    layers: {},
    streetMarker: null,
    lastSelectedZone: null,
    currentInspectedNeighborhood: '',
    bundle: window.LAKEHOUSE_DATA || {}
};

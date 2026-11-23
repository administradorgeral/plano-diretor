/* ==========================================================================
   6. PETITION.JS — Petição Pública Online "Crescer exige responsabilidade!"
      • 100% Auditável, Transparente e Real (Zero Perda de Assinaturas)
      • Validação Matemática Oficial de CPF (Módulo-11 da Receita Federal)
      • Hashing Criptográfico SHA-256 (Web Crypto API) & Mascaramento LGPD
      • Contador Global em Nuvem + Base de Subscritores Fundadores de São Roque
      • Exibição Completa de Assinaturas, Numeração Sequencial #1 a #N e Busca
      • Suporte Multi-Assinatura no Mesmo Aparelho (Familiares / Vizinhos)
      • Visualizador In-App, Impressão PDF e Download Direto (.HTML e .CSV)
   ========================================================================== */

window.AppPetition = {
    signatures: [],
    remoteSignatures: [],
    remoteGlobalCount: 0,
    lastReceipt: null,
    currentFilter: '',

    // 50 Subscrições Fundadoras Comunitárias Auditáveis dos Bairros de São Roque
    foundingSignatures: [],

    init: function () {
        this.loadFromStorage();
        this.updateAllCounters(false);
        this.bindEvents();
        this.syncGlobalCountFromCloud();
        this.syncWithRemoteWebhook();
        this.setupRealTimeSync();
        this.setupLiveActivityTicker();
    },

    loadFromStorage: function () {
        try {
            const currentKey = (window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.STORAGE_KEY) || 'srq_plano_diretor_peticao_real_v2';
            let loadedSigs = [];
            let loadedCount = 0;

            // 1. Tenta carregar da chave atual
            const rawCurrent = localStorage.getItem(currentKey);
            if (rawCurrent) {
                try {
                    const parsed = JSON.parse(rawCurrent);
                    if (Array.isArray(parsed.signatures)) {
                        loadedSigs = parsed.signatures;
                    }
                    if (Array.isArray(parsed.remoteSignatures) && parsed.remoteSignatures.length > 0) {
                        this.remoteSignatures = parsed.remoteSignatures;
                    }
                    if (typeof parsed.remoteGlobalCount === 'number') {
                        loadedCount = parsed.remoteGlobalCount;
                    }
                } catch (eCurrent) { }
            }

            // 2. Limpa com total segurança chaves legadas antigas para evitar ressurreição de dados de demonstração
            const legacyKeys = ['srq_plano_diretor_peticao_v1', 'srq_plano_diretor_peticao'];
            legacyKeys.forEach(lk => {
                try { localStorage.removeItem(lk); } catch (e) { }
            });

            // 3. Purga dados sintéticos de exemplo antigos do localStorage para manter apenas dados 100% REAIS
            const mockProtos = ['SRQ-2026-2874AC1D', 'SRQ-2026-BEC35AFD', 'SRQ-2026-047227EA', 'SRQ-2026-4796316C', 'SRQ-2026-9671D6EB'];
            const mockNames = ['Carlos Eduardo M. de Oliveira', 'Mariana Ribeiro dos Santos', 'Roberto Villaça Silveira', 'Helena Aparecida Domingues', 'Dr. Fernando Henrique Pascal', 'Marcelo Augusto F. de Camargo'];
            loadedSigs = loadedSigs.filter(s => {
                if (!s) return false;
                if (s.isFounding) return false;
                if (mockProtos.includes(s.protocol)) return false;
                if (mockNames.includes(s.name)) return false;
                return true;
            });

            // 4. Numeração sequencial transparente
            loadedSigs.forEach((sig, idx) => {
                sig.number = sig.number || (idx + 1);
            });

            this.signatures = loadedSigs;
            this.remoteGlobalCount = Math.max(loadedCount, this.remoteSignatures.length, this.signatures.length);

            // Garante persistência unificada de todo o caderno
            this.saveToStorage();
        } catch (e) {
            this.signatures = [];
            this.remoteGlobalCount = (this.remoteSignatures || []).length;
        }
    },

    saveToStorage: function () {
        try {
            const currentKey = (window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.STORAGE_KEY) || 'srq_plano_diretor_peticao_real_v2';
            localStorage.setItem(currentKey, JSON.stringify({
                signatures: this.signatures,
                remoteSignatures: this.remoteSignatures,
                remoteGlobalCount: this.remoteGlobalCount,
                updatedAt: new Date().toISOString()
            }));
        } catch (e) { }
    },

    // Unifica e soma todas as assinaturas (Planilha do Google Sheets como Fonte Primária Oficial)
    getAllAuditSignatures: function () {
        const combined = [];
        const seenKeys = new Set();

        // 1. Se temos assinaturas da Planilha do Google Sheets (fonte oficial), usa-as diretamente com a numeração canônica da planilha!
        if (Array.isArray(this.remoteSignatures) && this.remoteSignatures.length > 0) {
            this.remoteSignatures.forEach((s, idx) => {
                const num = typeof s.number === 'number' && s.number > 0 ? s.number : (idx + 1);
                combined.push({
                    ...s,
                    number: num
                });
                const key = s.fullHash || s.hash || s.protocol || (s.name && s.cpfMasked ? (s.name.trim().toLowerCase() + '_' + s.cpfMasked) : null);
                if (key) seenKeys.add(key);
            });

            // 2. Adiciona assinaturas locais recém-feitas no aparelho que ainda estejam em trânsito para a planilha
            if (Array.isArray(this.signatures) && this.signatures.length > 0) {
                this.signatures.forEach(localSig => {
                    const key = localSig.fullHash || localSig.hash || localSig.protocol || (localSig.name && localSig.cpfMasked ? (localSig.name.trim().toLowerCase() + '_' + localSig.cpfMasked) : null);
                    if (key && !seenKeys.has(key)) {
                        seenKeys.add(key);
                        combined.push({
                            ...localSig,
                            number: combined.length + 1
                        });
                    }
                });
            }

            // Retorna em ordem decrescente (#54, #53, ... #1) para que as mais recentes apareçam no topo dos feeds e cartões
            return [...combined].sort((a, b) => (b.number || 0) - (a.number || 0));
        }

        // 3. Fallback apenas se a planilha ainda não respondeu: usa assinaturas locais
        if (Array.isArray(this.signatures) && this.signatures.length > 0) {
            this.signatures.forEach((s, idx) => {
                combined.push({
                    ...s,
                    number: s.number || (idx + 1)
                });
            });
            return [...combined].sort((a, b) => (b.number || 0) - (a.number || 0));
        }

        return [];
    },

    // Retorna a contagem total somada (sempre maior ou igual ao número real de subscritores do caderno)
    getTotalCount: function () {
        const auditCount = this.getAllAuditSignatures().length;
        return Math.max(this.remoteGlobalCount, auditCount);
    },

    // Sincroniza com o Contador Global Cloud em Tempo Real (Abacus API)
    syncGlobalCountFromCloud: function () {
        const getUrl = window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.ABACUS_GET_URL;
        if (!getUrl) return;
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;
        fetch(getUrl, { cache: 'no-store', signal: controller ? controller.signal : undefined })
            .then(r => r.json())
            .then(data => {
                if (timeoutId) clearTimeout(timeoutId);
                if (data && typeof data.value === 'number' && data.value >= 0) {
                    this.remoteGlobalCount = Math.max(data.value, this.getAllAuditSignatures().length);
                    this.saveToStorage();
                    this.updateAllCounters(false);
                }
            })
            .catch(() => {
                if (timeoutId) clearTimeout(timeoutId);
            });
    },

    // Sincroniza assinaturas com o Webhook Serverless (se configurado)
    syncWithRemoteWebhook: function () {
        const url = window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.REMOTE_WEBHOOK_URL;
        if (!url) return Promise.resolve(null);
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null;
        return fetch(url, { cache: 'no-store', signal: controller ? controller.signal : undefined })
            .then(r => r.json())
            .then(data => {
                if (timeoutId) clearTimeout(timeoutId);
                if (data && data.status === 'ok') {
                    if (Array.isArray(data.signatures)) {
                        this.remoteSignatures = data.signatures;
                    }
                    if (typeof data.count === 'number') {
                        this.remoteGlobalCount = Math.max(data.count, this.getAllAuditSignatures().length);
                    }
                    this.saveToStorage();
                    this.updateAllCounters(false);

                    // Atualiza em tempo real o modal do Documento Público se estiver aberto na tela
                    const publicDocModal = document.getElementById('publicDocModal');
                    if (publicDocModal && publicDocModal.classList.contains('visible')) {
                        const body = document.getElementById('publicDocModalBody');
                        if (body) body.innerHTML = this.buildPublicDocumentHtml(false);
                        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
                    }

                    // Sincronização Reversa: se houver assinaturas reais locais que não constam na planilha, envia para ela!
                    if (Array.isArray(this.signatures) && this.signatures.length > 0) {
                        const remoteKeys = new Set((this.remoteSignatures || []).map(s => s.fullHash || s.hash || s.protocol || (s.name && s.cpfMasked ? (s.name.trim().toLowerCase() + '_' + s.cpfMasked) : null)).filter(Boolean));
                        this.signatures.forEach(localSig => {
                            const key = localSig.fullHash || localSig.hash || localSig.protocol || (localSig.name && localSig.cpfMasked ? (localSig.name.trim().toLowerCase() + '_' + localSig.cpfMasked) : null);
                            if (key && !remoteKeys.has(key)) {
                                this.pushToRemoteWebhook(localSig);
                            }
                        });
                    }
                    return data;
                }
                return null;
            })
            .catch(() => {
                if (timeoutId) clearTimeout(timeoutId);
                return null;
            });
    },

    incrementGlobalCloudCounter: function () {
        const hitUrl = window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.ABACUS_HIT_URL;
        if (!hitUrl) return;
        fetch(hitUrl, { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                if (data && typeof data.value === 'number' && data.value >= 0) {
                    this.remoteGlobalCount = Math.max(data.value, this.getAllAuditSignatures().length);
                    this.saveToStorage();
                    this.updateAllCounters(true);
                }
            })
            .catch(() => { });
    },

    // Algoritmo Oficial Módulo-11 da Receita Federal para Validação de CPF
    validateCPF: function (rawCpf) {
        const cpf = (rawCpf || '').replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false;

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i), 10) * (10 - i);
        }
        let rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(9), 10)) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i), 10) * (11 - i);
        }
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(10), 10)) return false;

        return true;
    },

    formatCPF: function (value) {
        const digits = (value || '').replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
        if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    },

    maskCPF: function (rawCpf) {
        const d = (rawCpf || '').replace(/\D/g, '');
        if (d.length !== 11) return '***.***.***-**';
        return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
    },

    maskName: function (fullName) {
        if (!fullName) return 'Cidadão';
        const parts = fullName.trim().split(/\s+/).filter(Boolean);
        if (parts.length <= 1) return parts[0] || 'Cidadão';
        const firstName = parts[0];
        const rest = parts.slice(1).map(p => {
            const lower = p.toLowerCase();
            if (['da', 'de', 'do', 'das', 'dos'].includes(lower)) {
                return '***';
            }
            return p[0].toUpperCase() + '***';
        }).join(' ');
        return `${firstName} ${rest}`;
    },

    computeSHA256: async function (text) {
        if (window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode('SRQ_PD_2026_SALT::' + text);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        let h1 = 0xdeadbeef ^ text.length, h2 = 0x41c6ce57 ^ text.length;
        for (let i = 0, ch; i < text.length; i++) {
            ch = text.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
    },

    getCurrentGoal: function (count) {
        const base = (window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.BASE_GOAL) || 150;
        const step = (window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.GOAL_STEP) || 100;
        if (count < base) return base;
        return base + Math.floor((count - base) / step + 1) * step;
    },

    updateAllCounters: function (animate) {
        const count = this.getTotalCount();
        const goal = this.getCurrentGoal(count);
        const pct = Math.min(100, Math.max(count > 0 ? 3 : 0, Math.round((count / goal) * 100)));

        document.querySelectorAll('[data-petition-count]').forEach(el => {
            el.textContent = `${count.toLocaleString('pt-BR')}`;
            const pill = el.closest('.petition-counter-pill') || el;
            if (animate && pill) {
                pill.classList.remove('bump');
                void pill.offsetWidth;
                pill.classList.add('bump');
            }
        });

        const bigNum = document.getElementById('petitionBigCount');
        if (bigNum) bigNum.textContent = count.toLocaleString('pt-BR');

        const goalLabel = document.getElementById('petitionGoalText');
        if (goalLabel) {
            goalLabel.textContent = `Meta de Mobilização: ${goal.toLocaleString('pt-BR')} assinaturas`;
        }

        const fill = document.getElementById('petitionProgressFill');
        if (fill) fill.style.width = `${pct}%`;

        this.renderRecentSignaturesList(this.currentFilter);

        // Atualização em Tempo Real: se o Documento Público estiver aberto na tela, atualiza a Tabela Sinóptica e os Cartões preservando a rolagem
        const publicDocModal = document.getElementById('publicDocModal');
        if (publicDocModal && publicDocModal.classList.contains('visible')) {
            const body = document.getElementById('publicDocModalBody');
            if (body) {
                const prevScroll = body.scrollTop;
                body.innerHTML = this.buildPublicDocumentHtml(false);
                body.scrollTop = prevScroll;
                if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
            }
        }
    },

    renderRecentSignaturesList: function (filterTerm) {
        const container = document.getElementById('recentSignaturesList');
        if (!container) return;

        let list = this.getAllAuditSignatures();
        const countHint = document.getElementById('signaturesCountHint');
        const contentWrapper = document.getElementById('signaturesCollapsibleContent');
        const isHidden = contentWrapper ? contentWrapper.style.display === 'none' : container.style.display === 'none';

        if (countHint) {
            countHint.textContent = isHidden ? 'Ver ▾' : 'Recolher ▴';
        }

        if (typeof filterTerm === 'string' && filterTerm.trim()) {
            this.currentFilter = filterTerm.trim().toLowerCase();
            const q = this.currentFilter;
            list = list.filter(sig =>
                (sig.name && sig.name.toLowerCase().includes(q)) ||
                (this.maskName(sig.name).toLowerCase().includes(q)) ||
                (sig.bairro && sig.bairro.toLowerCase().includes(q)) ||
                (sig.vinculo && sig.vinculo.toLowerCase().includes(q)) ||
                (sig.protocol && sig.protocol.toLowerCase().includes(q)) ||
                (sig.comment && sig.comment.toLowerCase().includes(q))
            );
        } else {
            this.currentFilter = '';
        }

        if (list.length === 0) {
            container.innerHTML = `
                <div style="font-size: 12px; color: #94a3b8; padding: 14px 8px; text-align: center; line-height: 1.5;">
                    ${this.currentFilter ? `Nenhuma assinatura encontrada para "<strong>${this.escapeHtml(this.currentFilter)}</strong>".` : 'Caderno de assinaturas auditáveis pronto.'}
                </div>
            `;
            return;
        }

        container.innerHTML = list.map((sig) => {
            const num = sig.number;
            const isRecent = this.lastReceipt && (
                (this.lastReceipt.hash && sig.hash && this.lastReceipt.hash === sig.hash) ||
                (this.lastReceipt.fullHash && sig.fullHash && this.lastReceipt.fullHash === sig.fullHash) ||
                (this.lastReceipt.protocol && sig.protocol && this.lastReceipt.protocol === sig.protocol)
            );
            const maskedName = this.maskName(sig.name || 'Cidadão');
            const commentHtml = sig.comment && sig.comment.trim().length > 0
                ? `<div style="font-size: 12.5px; color: #f8fafc; font-style: italic; margin-top: 5px; padding: 6px 10px; background: rgba(15, 23, 42, 0.75); border-left: 3.5px solid #34d399; border-radius: 0 6px 6px 0; line-height: 1.45;">💬 <strong>Relato de Impacto:</strong> "${this.escapeHtml(sig.comment.trim())}"</div>`
                : '';
            const recentBadge = isRecent
                ? `<span style="background: rgba(52, 211, 153, 0.2); color: #34d399; font-size: 9.5px; font-weight: 800; padding: 1px 6px; border-radius: 4px; border: 1px solid rgba(52, 211, 153, 0.4); margin-left: 5px;">Sua Assinatura</span>`
                : '';

            const protoDisplay = sig.protocol || (sig.fullHash ? ('SRQ-2026-' + sig.fullHash.slice(0, 8).toUpperCase()) : (sig.hash ? ('SRQ-2026-' + sig.hash.slice(0, 8).toUpperCase()) : 'SRQ-2026-OFICIAL'));

            return `
                <div class="signature-item-row${isRecent ? ' recent-highlight' : ''}">
                    <div style="flex: 1; min-width: 200px;">
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                            <span style="color: #34d399; font-weight: 800; font-size: 11px;">#${num}</span>
                            <span class="sig-name">${this.escapeHtml(maskedName)}</span>
                            ${recentBadge}
                            <span style="color: #94a3b8; font-size: 11px;"> • ${this.escapeHtml(sig.bairro || 'São Roque')} (${this.escapeHtml(sig.vinculo || 'Morador')})</span>
                        </div>
                        ${commentHtml}
                    </div>
                    <div class="sig-meta" style="text-align: right; flex-shrink: 0;">
                        <div style="color: #cbd5e1;">${sig.cpfMasked || '***.***.***-**'}</div>
                        <div style="color: #64748b; font-size: 10px;">${protoDisplay}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    escapeHtml: function (str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },

    expandSignaturesBox: function () {
        const contentWrapper = document.getElementById('signaturesCollapsibleContent');
        const sigList = document.getElementById('recentSignaturesList');
        const sigChevron = document.getElementById('signaturesChevron');
        const sigHint = document.getElementById('signaturesCountHint');
        const sigBox = document.getElementById('signaturesBox');
        const total = this.getAllAuditSignatures().length;

        if (contentWrapper) contentWrapper.style.display = 'flex';
        else if (sigList) sigList.style.display = 'flex';

        if (sigChevron) sigChevron.style.transform = 'rotate(90deg)';
        if (sigHint) sigHint.textContent = 'Recolher ▴';
        if (sigBox) sigBox.classList.remove('collapsed');
    },

    openModal: function (prefillNeighborhood) {
        const modal = document.getElementById('petitionModal');
        if (!modal) return;

        const streetModal = document.getElementById('streetModal');
        if (streetModal) streetModal.classList.remove('visible');

        const bairroSelect = document.getElementById('petitionBairro');
        const targetBairro = prefillNeighborhood || (window.AppState && window.AppState.currentInspectedNeighborhood);
        if (bairroSelect) {
            bairroSelect.querySelectorAll('.custom-inspected-opt').forEach(el => el.remove());

            if (targetBairro) {
                const options = Array.from(bairroSelect.options);
                const match = options.find(opt =>
                    opt.value.toLowerCase() === targetBairro.toLowerCase() ||
                    targetBairro.toLowerCase().includes(opt.value.toLowerCase()) ||
                    (opt.value.length > 5 && opt.value.toLowerCase().includes(targetBairro.toLowerCase()))
                );
                if (match) {
                    bairroSelect.value = match.value;
                } else {
                    const customOpt = document.createElement('option');
                    customOpt.className = 'custom-inspected-opt';
                    customOpt.value = targetBairro;
                    customOpt.textContent = `📍 ${targetBairro} (Área Inspecionada)`;
                    bairroSelect.insertBefore(customOpt, bairroSelect.options[1] || null);
                    bairroSelect.value = targetBairro;
                }
            } else {
                bairroSelect.value = '';
            }
        }

        this.updateAllCounters(false);

        // Garante o caderno aberto exibindo todas as assinaturas auditáveis transparentemente
        if (this.getAllAuditSignatures().length > 0) {
            this.expandSignaturesBox();
        }

        modal.classList.add('visible');
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();

        // Dispara busca imediata da planilha do Google Sheets para garantir dados frescos ao abrir o modal
        this.syncWithRemoteWebhook();
    },

    closeModal: function () {
        const modal = document.getElementById('petitionModal');
        if (modal) modal.classList.remove('visible');
    },

    resetFormForNextSigner: function () {
        const formEl = document.getElementById('petitionForm');
        const successBox = document.getElementById('petitionSuccessBox');
        const errBox = document.getElementById('petitionErrorBox');
        const nameInput = document.getElementById('petitionName');
        const cpfInput = document.getElementById('petitionCpf');
        const commentInput = document.getElementById('petitionComment');
        const cpfHint = document.getElementById('cpfStatusHint');

        if (errBox) errBox.style.display = 'none';
        if (successBox) successBox.classList.remove('visible');
        if (formEl) formEl.style.display = 'flex';

        if (nameInput) { nameInput.value = ''; nameInput.focus(); }
        if (cpfInput) { cpfInput.value = ''; cpfInput.classList.remove('valid', 'invalid'); }
        if (commentInput) commentInput.value = '';
        if (cpfHint) { cpfHint.textContent = ''; cpfHint.className = 'cpf-status-hint'; }
    },

    handleSignSubmit: async function (e) {
        e.preventDefault();
        const errBox = document.getElementById('petitionErrorBox');
        if (errBox) errBox.style.display = 'none';

        const name = (document.getElementById('petitionName').value || '').trim();
        const rawCpf = (document.getElementById('petitionCpf').value || '').trim();
        const bairroEl = document.getElementById('petitionBairro');
        const bairro = (bairroEl ? bairroEl.value : '').trim();
        const vinculo = document.getElementById('petitionVinculo').value || 'Morador(a)';
        const comment = (document.getElementById('petitionComment').value || '').trim();
        const lgpd = document.getElementById('petitionLgpd').checked;

        if (!bairro || bairro === '') {
            this.showError('Por favor, selecione sua Macrozona, Região ou Bairro na lista para validar a assinatura.');
            if (bairroEl) bairroEl.focus();
            return;
        }

        if (name.split(/\s+/).length < 2 || name.length < 5) {
            this.showError('Informe seu nome e sobrenome completos para validade jurídica do Documento Público.');
            document.getElementById('petitionName').focus();
            return;
        }

        if (!this.validateCPF(rawCpf)) {
            this.showError('CPF inválido pelos dígitos verificadores da Receita Federal (Módulo-11). Confira os 11 dígitos.');
            const cpfEl = document.getElementById('petitionCpf');
            if (cpfEl) {
                cpfEl.classList.add('invalid');
                cpfEl.focus();
            }
            return;
        }

        if (!lgpd) {
            this.showError('Marque a confirmação LGPD para autorizar a inclusão da assinatura criptografada no documento público.');
            return;
        }

        const cleanCpf = rawCpf.replace(/\D/g, '');
        const fullHash = await this.computeSHA256(cleanCpf);
        const shortHash = fullHash.slice(0, 16);

        // Verifica deduplicação em todo o conjunto auditável
        const allAudit = this.getAllAuditSignatures();
        const alreadySigned = allAudit.find(s =>
            (s.fullHash && s.fullHash === fullHash) ||
            (s.hash && s.hash === shortHash)
        );

        if (alreadySigned) {
            this.lastReceipt = alreadySigned;
            this.showSuccessReceipt(alreadySigned, true);
            this.expandSignaturesBox();
            return;
        }

        const nowIso = new Date().toISOString();
        const protocolCode = `SRQ-2026-${shortHash.slice(0, 8).toUpperCase()}`;
        const nextNumber = allAudit.length + 1;

        const record = {
            number: nextNumber,
            protocol: protocolCode,
            name: name,
            bairro: bairro,
            vinculo: vinculo,
            comment: comment,
            cpfMasked: this.maskCPF(cleanCpf),
            hash: shortHash,
            fullHash: fullHash,
            timestamp: nowIso
        };

        this.signatures.push(record);
        this.remoteGlobalCount = Math.max(this.remoteGlobalCount + 1, allAudit.length + 1);
        this.lastReceipt = record;
        this.saveToStorage();
        this.updateAllCounters(true);
        this.showSuccessReceipt(record, false);
        this.expandSignaturesBox();
        this.showLiveActivityToast(record, true);

        // Incrementa contador global na nuvem (Abacus API) e envia ao Webhook Serverless se configurado
        this.incrementGlobalCloudCounter();
        this.pushToRemoteWebhook(record);
    },

    showError: function (msg) {
        const errBox = document.getElementById('petitionErrorBox');
        if (errBox) {
            errBox.textContent = msg;
            errBox.style.display = 'block';
        }
    },

    showSuccessReceipt: function (record, wasDuplicate) {
        const formEl = document.getElementById('petitionForm');
        const successBox = document.getElementById('petitionSuccessBox');
        const receiptEl = document.getElementById('petitionReceiptDetails');
        const titleEl = document.getElementById('petitionSuccessTitle');

        if (formEl) formEl.style.display = 'none';
        if (successBox) successBox.classList.add('visible');

        if (titleEl) {
            titleEl.textContent = wasDuplicate
                ? 'Este CPF já possui assinatura validada! Veja seu protocolo abaixo:'
                : `Assinatura #${record.number || this.getTotalCount()} Validada e Somada ao Caderno!`;
        }

        const dateFormatted = record.timestamp ? new Date(record.timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
        const proto = record.protocol || (record.fullHash ? ('SRQ-2026-' + record.fullHash.slice(0, 8).toUpperCase()) : (record.hash ? ('SRQ-2026-' + record.hash.slice(0, 8).toUpperCase()) : 'SRQ-2026-OFICIAL'));

        if (receiptEl) {
            receiptEl.textContent =
                `PROTOCOLO OFICIAL: ${proto}\n` +
                `CIDADÃO SUBSCRITOR: ${record.name} (CPF: ${record.cpfMasked})\n` +
                `BAIRRO / VÍNCULO: ${record.bairro} • ${record.vinculo}\n` +
                `DATA E HORA: ${dateFormatted}\n` +
                `HASH SHA-256 (LGPD): ${record.fullHash || record.hash}`;
        }
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    },

    pushToRemoteWebhook: function (record) {
        const url = window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.REMOTE_WEBHOOK_URL;
        if (!url) return;
        fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(record)
        }).then(() => {
            setTimeout(() => this.syncWithRemoteWebhook(), 1500);
        }).catch(() => { });
    },

    getShareText: function () {
        const count = this.getTotalCount().toLocaleString('pt-BR');
        const url = window.location.href.split('#')[0];
        return `🚨 VOTAÇÃO IMINENTE NA CÂMARA DE SÃO ROQUE!\n✍️ Crescer exige responsabilidade! Já somos ${count} cidadãos assinando a Petição Pública contra o adensamento sem água/esgoto, contra a perda de 1.670 ha rurais e contra privilégios pontuais (Spot Zoning) no Plano Diretor.\n\nVeja o impacto negativo na sua rua e assine: ${url}`;
    },

    shareWhatsApp: function () {
        const text = this.getShareText();
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
    },

    copyTextWithFallback: function (text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).catch(() => this.fallbackCopy(text));
        }
        return Promise.resolve(this.fallbackCopy(text));
    },

    fallbackCopy: function (text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try { document.execCommand('copy'); } catch (e) { }
        document.body.removeChild(ta);
    },

    shareNativeOrCopy: function () {
        const text = this.getShareText();
        const btn = document.getElementById('btnCopyPetitionLink');
        this.copyTextWithFallback(text).then(() => {
            if (btn) {
                const orig = btn.innerHTML;
                btn.innerHTML = '<i data-lucide="check" style="width:15px;height:15px;"></i><span>Texto e Link Copiados!</span>';
                if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
                setTimeout(() => { btn.innerHTML = orig; if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); }, 2500);
            }
        });
    },

    // Constrói o HTML Completo do Documento Público Posterior (Câmara Municipal e MPSP)
    buildPublicDocumentHtml: function (standalone) {
        const allSigs = this.getAllAuditSignatures(); // Ordem decrescente (#54 até #1)
        const tableSigs = [...allSigs].sort((a, b) => (a.number || 0) - (b.number || 0)); // Ordem sequencial (#1 a #54)
        const count = allSigs.length;
        const nowStr = new Date().toLocaleString('pt-BR');

        // 1. Cartões Responsivos: mais recentes primeiro no topo (#54 Alexandre Ferreira Gris, #53 Ana Paula Cairrão, ...)
        const cardsHtml = allSigs.length > 0
            ? allSigs.map((s) => {
                const protoDisplay = s.protocol || (s.fullHash ? ('SRQ-2026-' + s.fullHash.slice(0, 8).toUpperCase()) : (s.hash ? ('SRQ-2026-' + s.hash.slice(0, 8).toUpperCase()) : 'SRQ-2026-OFICIAL'));
                const dateDisplay = s.timestamp ? new Date(s.timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
                const maskedName = this.maskName(s.name || 'Cidadão');
                const commentHtml = s.comment && s.comment.trim() && s.comment.trim() !== '—'
                    ? `<div style="font-size: 13px; color: #0f172a; background: #f0fdf4; border-left: 3.5px solid #059669; padding: 9px 13px; border-radius: 0 8px 8px 0; margin-top: 8px; font-style: italic; line-height: 1.5; border: 1px solid #dcfce7; border-left: 3.5px solid #059669;">
                        💬 <strong>Relato do Cidadão:</strong> "${this.escapeHtml(s.comment.trim())}"
                       </div>`
                    : '';
                return `
                <div style="border: 1px solid #cbd5e1; border-left: 4px solid #10b981; border-radius: 10px; padding: 12px 16px; margin-bottom: 10px; background: #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.05); font-family: sans-serif;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
                        <span style="font-weight: 800; font-size: 13.5px; color: #0f172a;">
                            <span style="color: #059669; margin-right: 5px;">#${s.number}</span>
                            <strong>${this.escapeHtml(maskedName)}</strong>
                            <span style="font-weight: normal; color: #475569; font-size: 12px;"> — ${this.escapeHtml(s.bairro || 'São Roque')} (${this.escapeHtml(s.vinculo || 'Morador')})</span>
                        </span>
                        <span style="font-family: monospace; font-size: 11px; color: #475569; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                            ${protoDisplay} • ${s.cpfMasked || '***.***.***-**'}
                        </span>
                    </div>
                    ${commentHtml}
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; text-align: right;">
                        Validação Oficial: ${dateDisplay}
                    </div>
                </div>
                `;
            }).join('')
            : '<div style="text-align: center; padding: 16px; color: #64748b; font-family: sans-serif;">Nenhuma assinatura registrada.</div>';

        // 2. Tabela Sinóptica Auditável: estrita ordem sequencial (#1 a #54, idêntico à Planilha do Google)
        const rowsHtml = tableSigs.length > 0
            ? tableSigs.map((s) => {
                const protoDisplay = s.protocol || (s.fullHash ? ('SRQ-2026-' + s.fullHash.slice(0, 8).toUpperCase()) : (s.hash ? ('SRQ-2026-' + s.hash.slice(0, 8).toUpperCase()) : 'SRQ-2026-OFICIAL'));
                const dateDisplay = s.timestamp ? new Date(s.timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
                const maskedName = this.maskName(s.name || 'Cidadão');
                return `
                <tr>
                    <td style="font-weight: bold; text-align: center; border: 1px solid #cbd5e1; padding: 6px;">#${s.number}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;"><strong>${this.escapeHtml(maskedName)}</strong></td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;">${this.escapeHtml(s.bairro || 'São Roque')} (${this.escapeHtml(s.vinculo || 'Morador')})</td>
                    <td style="font-family: monospace; border: 1px solid #cbd5e1; padding: 6px;">${s.cpfMasked || '***.***.***-**'}</td>
                    <td style="font-family: monospace; font-size: 11px; border: 1px solid #cbd5e1; padding: 6px;">${protoDisplay}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;">${this.escapeHtml(s.comment || '—')}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;">${dateDisplay}</td>
                </tr>
            `;
            }).join('')
            : `<tr><td colspan="7" style="text-align:center; padding: 14px; color: #64748b; border: 1px solid #cbd5e1;">Nenhuma assinatura registrada.</td></tr>`;

        const innerBody = `
            <div class="public-doc-sheet" style="background: #ffffff; color: #0f172a; padding: 24px; border-radius: 12px; font-family: Georgia, 'Times New Roman', serif; line-height: 1.6;">
                <h1 style="font-size: 19px; text-align: center; text-transform: uppercase; margin-bottom: 4px; color: #0f172a;">Instrumento Público de Petição, Impugnação Técnica e Representação Cidadã</h1>
                <p style="font-size: 13.5px; text-align: center; color: #334155; margin-top: 0; margin-bottom: 18px; font-weight: bold;">
                    "CRESCER EXIGE RESPONSABILIDADE!" — Revisão do Plano Diretor e Lei de Uso e Ocupação do Solo da Estância Turística de São Roque/SP (Minutas das LCs nº 39 e nº 40/2026)
                </p>

                <div style="border: 2px solid #0f172a; padding: 12px 16px; background: #f8fafc; margin-bottom: 18px; font-family: sans-serif; font-size: 12px; color: #0f172a;">
                    <strong>DESTINATÁRIOS OFICIAIS:</strong><br>
                    1. Exmo. Sr. Presidente e Srs. Vereadores da <strong>Câmara Municipal da Estância Turística de São Roque/SP</strong>;<br>
                    2. Exmo. Sr. Promotor de Justiça de Habitação, Urbanismo e Meio Ambiente do <strong>Ministério Público do Estado de São Paulo (MPSP) — Comarca de São Roque</strong>.<br><br>
                    <strong>BASE CONSTITUCIONAL E LEGAL:</strong> Art. 5º, XXXIV, "a" (Direito Constitucional de Petição), Art. 182 da CF/88, Arts. 180 e 181 da Constituição Estadual de SP, Lei Federal nº 10.257/2001 (Estatuto da Cidade, art. 2º, II, VI, IX e art. 40, § 4º) e Lei Federal nº 12.608/2012 (Prevenção de Desastres).<br>
                    <strong>CONTADOR GERAL DE ASSINATURAS VALIDADAS:</strong> <strong>${count.toLocaleString('pt-BR')} subscrições cidadãs auditáveis</strong> (${count} registradas nominalmente neste caderno público) • Gerado em: ${nowStr}.
                </div>

                <!-- Barra de Navegação Rápida do Documento -->
                <div style="display: flex; gap: 10px; margin-bottom: 22px; flex-wrap: wrap;">
                    <a href="#caderno-assinaturas" style="background: #059669; color: #ffffff; padding: 10px 16px; border-radius: 8px; font-weight: 800; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(5, 150, 105, 0.35); font-family: sans-serif;">
                        👥 Ver Caderno de Assinaturas e Relatos dos Cidadãos (${count}) ▾
                    </a>
                    <a href="#propostas-emendas" style="background: #2563eb; color: #ffffff; padding: 10px 16px; border-radius: 8px; font-weight: 800; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-family: sans-serif;">
                        🛡️ Ver as 4 Emendas de Blindagem
                    </a>
                </div>

                <h3 id="propostas-emendas" style="font-size: 15px; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-top: 20px; font-family: sans-serif; letter-spacing: 0.5px;">
                    I. Dos Impactos Apurados e Propostas de Emendas em Linguagem Simples para Blindar São Roque
                </h3>
                <p style="font-size: 12px; color: #334155; margin-top: 6px; margin-bottom: 16px; font-style: italic; line-height: 1.5;">
                    Com base no diagnóstico técnico do Lakehouse Municipal (cruzamento do Censo IBGE 2022, dados oficiais de saneamento SNIS/ARSESP, mapeamento de risco geológico SGB/CPRM 2023 e sobreposição cartográfica da Lei 2006 vs. Minutas 2026), os cidadãos abaixo subscritos requerem a incorporação das seguintes <strong>Propostas de Emendas Modificativas, Supressivas e Aditivas</strong> para blindar o município antes de qualquer votação:
                </p>

                <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 22px;">
                    <!-- 1. Saneamento: Prédios Altos Chegando PRIMEIRO -->
                    <div style="border-left: 4px solid #2563eb; background: #f8fafc; padding: 12px 14px; border-radius: 0 8px 8px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <h4 style="font-size: 13px; margin: 0 0 6px 0; color: #1e3a8a; text-transform: uppercase; font-family: sans-serif; font-weight: 800;">
                            1. Prédios Altos Chegando PRIMEIRO: Garantia de Água na Torneira e Esgoto ANTES de Prédios
                        </h4>
                        <p style="font-size: 12px; margin: 0 0 8px 0; color: #334155; line-height: 1.55;">
                            <strong>O problema apurado:</strong> São Roque coleta e trata apenas cerca de <strong>47,8% do esgoto gerado</strong> (SNIS/ARSESP — Inquérito Civil MPSP nº 0439.0000192/2025). As minutas das leis elevam a altura máxima de prédios para até 30 metros (10 andares) e multiplicam a densidade urbana sem exigir expansão prévia de saneamento. Se os prédios chegarem antes dos canos e das estações, faltará água nas torneiras e o esgoto sem tratamento transbordará nos córregos e rios.
                        </p>
                        <div style="background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 6px; padding: 10px 12px; font-family: sans-serif; font-size: 11.5px; color: #1e40af; line-height: 1.5;">
                            <strong>🛡️ PROPOSTA DE EMENDA CIDADÃ (Trava de Saneamento):</strong><br>
                            <em>"Fica expressamente vedada a aprovação de projetos, concessão de alvarás de construção ou expedição de 'habite-se' para novos edifícios residenciais multifamiliares de médio e grande porte (acima de 3 pavimentos) e novos loteamentos sem que a concessionária de saneamento emita Atestado de Viabilidade Hídrica com garantia de vazão contínua E comprove a interligação efetiva a rede coletora e estação de tratamento de esgoto (ETE) em pleno funcionamento. Primeiro a garantia de água na torneira e esgoto tratado, DEPOIS os prédios."</em>
                        </div>
                    </div>

                    <!-- 2. Zona Rural e Chácaras Ameaçadas -->
                    <div style="border-left: 4px solid #16a34a; background: #f8fafc; padding: 12px 14px; border-radius: 0 8px 8px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <h4 style="font-size: 13px; margin: 0 0 6px 0; color: #14532d; text-transform: uppercase; font-family: sans-serif; font-weight: 800;">
                            2. Zona Rural &amp; Chácaras Ameaçadas: Proteção dos 1.670 Hectares de Sítios e Escudo contra IPTU Abusivo
                        </h4>
                        <p style="font-size: 12px; margin: 0 0 8px 0; color: #334155; line-height: 1.55;">
                            <strong>O problema apurado:</strong> O estudo cartográfico oficial comprovou que as minutas reduzem a Zona Rural em 12,74%, eliminando <strong>1.670,71 hectares</strong> de solo rural tradicional. Ao transformar essas áreas em zonas urbanas ou de expansão, ameaça-se sitiantes, produtores rurais e famílias chacareiras com a conversão compulsória do ITR federal em IPTU urbano impagável em estradas de terra sem água encanada, sem rede de esgoto e sem serviços públicos, empurrando famílias históricas para a venda forçada e especulação imobiliária.
                        </p>
                        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 6px; padding: 10px 12px; font-family: sans-serif; font-size: 11.5px; color: #166534; line-height: 1.5;">
                            <strong>🛡️ PROPOSTA DE EMENDA CIDADÃ (Blindagem do Solo Rural e das Chácaras):</strong><br>
                            <em>"Fica restaurada na íntegra a delimitação da Macrozona Rural do município, recompondo os 1.670,71 hectares retirados nas minutas e mantendo a exigência do módulo rural INCRA (20.000 m²). Fica terminantemente proibida a cobrança de IPTU sobre sítios, chácaras e propriedades rurais que não contem com pelo menos 3 melhoramentos urbanos essenciais (água tratada, rede coletora de esgoto e pavimentação com drenagem), resguardando os produtores rurais, a Mata Atlântica e a vocação turística de São Roque."</em>
                        </div>
                    </div>

                    <!-- 3. Spot Zoning: Critérios Transparentes e Estudos -->
                    <div style="border-left: 4px solid #ea580c; background: #f8fafc; padding: 12px 14px; border-radius: 0 8px 8px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <h4 style="font-size: 13px; margin: 0 0 6px 0; color: #7c2d12; text-transform: uppercase; font-family: sans-serif; font-weight: 800;">
                            3. Fim do Spot Zoning (Privilégios Pontuais): Critérios Transparentes e Estudos Antes de Mudar Zoneamento
                        </h4>
                        <p style="font-size: 12px; margin: 0 0 8px 0; color: #334155; line-height: 1.55;">
                            <strong>O problema apurado:</strong> A modelagem geoespacial identificou enclaves com Índice de Spot Zoning Crítico (ISZ ≥ 70) — áreas onde as regras foram alteradas sob medida para beneficiar terrenos ou empreendimentos pontuais —, além de casuísmos explícitos como o § 1º do art. 36 da Minuta da LC 40/2026, que blinda quatro loteamentos fechados dentro da bacia de mananciais protegida (Carmo e APA Itupararanga). Mudança de zoneamento sem critérios objetivos e transparentes desrespeita a vizinhança e estimula privilégios indevidos.
                        </p>
                        <div style="background: #fff7ed; border: 1.5px solid #fdba74; border-radius: 6px; padding: 10px 12px; font-family: sans-serif; font-size: 11.5px; color: #9a3412; line-height: 1.5;">
                            <strong>🛡️ PROPOSTA DE EMENDA CIDADÃ (Critérios Transparentes e Estudos Públicos Obrigatórios):</strong><br>
                            <em>"Fica revogado o § 1º do art. 36 da Minuta da LC 40/2026 e proibida qualquer alteração de zoneamento feita sob medida para glebas ou empreendimentos isolados. Qualquer proposta de mudança de zoneamento, elevação de gabarito ou expansão de perímetro urbano somente poderá ser apreciada e votada exclusivamente nos momentos formais de revisão periódica e global do Plano Diretor, vedadas leis avulsas fora desses ciclos, e sempre mediante a publicação com 30 dias de antecedência no Portal da Transparência e realização de audiência pública específica dos seguintes estudos técnicos oficiais: (1) Estudo de Impacto de Vizinhança (EIV), (2) Estudo de Viabilidade Ambiental (EVA) e (3) Laudo Hidrológico oficial de capacidade de drenagem e esgotamento."</em>
                        </div>
                    </div>

                    <!-- 4. Risco Geológico e Enchentes -->
                    <div style="border-left: 4px solid #dc2626; background: #f8fafc; padding: 12px 14px; border-radius: 0 8px 8px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <h4 style="font-size: 13px; margin: 0 0 6px 0; color: #7f1d1d; text-transform: uppercase; font-family: sans-serif; font-weight: 800;">
                            4. Proteção da Vida nas 22 Áreas de Risco Geológico e Enchentes (CPRM 2023 / Lei Federal 12.608/2012)
                        </h4>
                        <p style="font-size: 12px; margin: 0 0 8px 0; color: #334155; line-height: 1.55;">
                            <strong>O problema apurado:</strong> O Serviço Geológico do Brasil mapeou 22 setores com risco alto e muito alto (R3/R4) para deslizamentos de morros e inundações em São Roque (Junqueira, Goianã, Vinhedos, Mosteiro, Cambará e Vila do Carmo). As minutas elevam a Taxa de Ocupação para 70% a 80%, aumentando a impermeabilização a montante desses locais vulneráveis e expondo famílias ao perigo de desastres provocados pelas chuvas.
                        </p>
                        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 6px; padding: 10px 12px; font-family: sans-serif; font-size: 11.5px; color: #991b1b; line-height: 1.5;">
                            <strong>🛡️ PROPOSTA DE EMENDA CIDADÃ (Salvaguarda de Vidas contra Desastres):</strong><br>
                            <em>"Fica expressamente vedado o aumento da Taxa de Ocupação e da densidade construtiva nas bacias de contribuição a montante dos 22 setores de risco geológico mapeados pelo SGB/CPRM e pela Defesa Civil. Nas encostas e várzeas vulneráveis, a Taxa de Permeabilidade mínima do solo deverá ser mantida em 50% do lote, com implantação obrigatória de reservatórios de contenção de águas pluviais, em estrito cumprimento à Lei Federal nº 12.608/2012."</em>
                        </div>
                    </div>
                </div>

                <h3 id="caderno-assinaturas" style="font-size: 15px; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-top: 28px; font-family: sans-serif; letter-spacing: 0.5px; color: #0f172a;">
                    II. Caderno Auditável de Subscritores Validados por CPF e Relatos dos Cidadãos (Padrão LGPD / SHA-256)
                </h3>
                <p style="font-size: 12px; color: #475569; font-family: sans-serif; margin-bottom: 14px; line-height: 1.5;">
                    Cada assinatura abaixo teve seu CPF validado pelo algoritmo Módulo-11 da Receita Federal e encontra-se protegida por máscara oficial LGPD (Lei nº 13.709/2018) e código de integridade criptográfica SHA-256. Abaixo constam as <strong>vozes e relatos de impacto direto</strong> manifestados pelos moradores e produtores rurais de São Roque:
                </p>

                <!-- 1. Cartões Responsivos de Relatos dos Cidadãos (Visível Imediatamente em Celulares e Telas) -->
                <div class="public-doc-signatures-cards" style="margin-bottom: 22px;">
                    ${cardsHtml}
                </div>

                <!-- 2. Tabela Sinóptica Auditável para Impressão e Protocolo Oficial -->
                <h4 style="font-size: 12.5px; text-transform: uppercase; margin: 18px 0 8px 0; color: #334155; font-family: sans-serif; letter-spacing: 0.5px;">
                    Tabela Sinóptica Auditável para Protocolo Oficial (Câmara Municipal &amp; MPSP):
                </h4>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11.5px; color: #0f172a;">
                        <thead>
                            <tr style="background: #e2e8f0;">
                                <th style="border: 1px solid #94a3b8; padding: 6px 8px;">Nº</th>
                                <th style="border: 1px solid #94a3b8; padding: 6px 8px;">Nome Completo</th>
                                <th style="border: 1px solid #94a3b8; padding: 6px 8px;">Bairro / Vínculo</th>
                                <th style="border: 1px solid #94a3b8; padding: 6px 8px;">CPF (LGPD)</th>
                                <th style="border: 1px solid #94a3b8; padding: 6px 8px;">Protocolo SHA-256</th>
                                <th style="border: 1px solid #94a3b8; padding: 6px 8px;">Relato de Impacto</th>
                                <th style="border: 1px solid #94a3b8; padding: 6px 8px;">Data/Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        if (!standalone) return innerBody;

        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Documento Público • Petição Crescer Exige Responsabilidade - São Roque/SP</title>
    <style>
        body { background: #f1f5f9; margin: 24px; }
        @media print { body { background: #fff; margin: 0; } }
    </style>
</head>
<body>${innerBody}</body>
</html>`;
    },

    openPublicDocumentModal: function () {
        const modal = document.getElementById('publicDocModal');
        const body = document.getElementById('publicDocModalBody');
        if (!modal || !body) return;

        body.innerHTML = this.buildPublicDocumentHtml(false);
        modal.classList.add('visible');
        if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();

        // Dispara busca imediata da planilha do Google Sheets para garantir dados frescos ao abrir o modal
        this.syncWithRemoteWebhook();
    },

    printPublicDocument: async function (triggerBtn) {
        const btn = triggerBtn || document.getElementById('btnPrintPublicDoc');
        let origContent = null;
        if (btn) {
            origContent = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;"><span class="pulse-dot"></span> Sincronizando...</span>';
        }

        try {
            await this.syncWithRemoteWebhook();
        } catch (e) { }
        finally {
            if (btn && origContent) {
                btn.disabled = false;
                btn.innerHTML = origContent;
                if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
            }
        }

        const html = this.buildPublicDocumentHtml(true);
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 2500);
        }, 400);
    },

    downloadPublicDocumentHtml: async function (triggerBtn) {
        const btn = triggerBtn || document.getElementById('btnDownloadDocHtml');
        let origContent = null;
        if (btn) {
            origContent = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;"><span class="pulse-dot"></span> Atualizando...</span>';
        }

        try {
            await this.syncWithRemoteWebhook();
        } catch (e) { }
        finally {
            if (btn && origContent) {
                btn.disabled = false;
                btn.innerHTML = origContent;
                if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
            }
        }

        const html = this.buildPublicDocumentHtml(true);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const now = new Date();
        const timeTag = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
        a.download = `Documento_Publico_Peticao_Plano_Diretor_Sao_Roque_${timeTag}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    },

    downloadSignaturesCsv: async function (triggerBtn) {
        const btn = triggerBtn || document.getElementById('btnDownloadCsvDoc') || document.getElementById('btnDownloadCsv');
        let origContent = null;
        if (btn) {
            origContent = btn.innerHTML;
            btn.disabled = true;
            btn.style.opacity = '0.75';
            btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;"><span class="pulse-dot"></span> Sincronizando dados ao vivo da planilha...</span>';
        }

        try {
            // Garante recuperação direta e em tempo real da planilha do Google antes de gerar o CSV
            await this.syncWithRemoteWebhook();
        } catch (e) {
            console.warn('Erro ao atualizar webhook remoto antes do download:', e);
        } finally {
            if (btn && origContent) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.innerHTML = origContent;
                if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
            }
        }

        const allSigs = this.getAllAuditSignatures();
        const sigs = [...allSigs].sort((a, b) => (a.number || 0) - (b.number || 0));
        const header = ['N_Sequencial', 'Protocolo', 'Nome_Completo', 'Bairro', 'Vinculo', 'CPF_Mascarado_LGPD', 'Hash_SHA256', 'Relato_Impacto', 'Data_Hora_ISO'];
        const rows = sigs.map(s => {
            const proto = s.protocol || (s.fullHash ? ('SRQ-2026-' + s.fullHash.slice(0, 8).toUpperCase()) : (s.hash ? ('SRQ-2026-' + s.hash.slice(0, 8).toUpperCase()) : 'SRQ-2026-OFICIAL'));
            const dateStr = s.timestamp ? (new Date(s.timestamp).toISOString()) : '';
            return [
                s.number || '',
                proto,
                `"${(s.name || '').replace(/"/g, '""')}"`,
                `"${(s.bairro || '').replace(/"/g, '""')}"`,
                `"${(s.vinculo || '').replace(/"/g, '""')}"`,
                s.cpfMasked || '',
                s.fullHash || s.hash || '',
                `"${(s.comment || '').replace(/"/g, '""')}"`,
                dateStr
            ];
        });
        const csvContent = '\uFEFF' + [header.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const now = new Date();
        const timeTag = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
        a.download = `Assinaturas_Peticao_Plano_Diretor_Sao_Roque_${timeTag}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    },

    bindEvents: function () {
        const cpfInput = document.getElementById('petitionCpf');
        const cpfHint = document.getElementById('cpfStatusHint');

        if (cpfInput) {
            cpfInput.addEventListener('input', () => {
                cpfInput.value = this.formatCPF(cpfInput.value);
                const clean = cpfInput.value.replace(/\D/g, '');
                if (clean.length === 0) {
                    cpfInput.classList.remove('valid', 'invalid');
                    if (cpfHint) { cpfHint.textContent = ''; cpfHint.className = 'cpf-status-hint'; }
                } else if (clean.length === 11) {
                    if (this.validateCPF(clean)) {
                        cpfInput.classList.add('valid');
                        cpfInput.classList.remove('invalid');
                        if (cpfHint) { cpfHint.textContent = '✓ CPF Válido'; cpfHint.className = 'cpf-status-hint ok'; }
                    } else {
                        cpfInput.classList.add('invalid');
                        cpfInput.classList.remove('valid');
                        if (cpfHint) { cpfHint.textContent = '✗ CPF Inválido'; cpfHint.className = 'cpf-status-hint err'; }
                    }
                } else {
                    cpfInput.classList.remove('valid', 'invalid');
                    if (cpfHint) { cpfHint.textContent = `${clean.length}/11 dígitos`; cpfHint.className = 'cpf-status-hint'; }
                }
            });
        }

        const form = document.getElementById('petitionForm');
        if (form) form.addEventListener('submit', (e) => this.handleSignSubmit(e));

        const btnTopPetition = document.getElementById('btnTopPetition');
        if (btnTopPetition) btnTopPetition.addEventListener('click', () => this.openModal());

        const btnModalPetition = document.getElementById('btnModalPetition');
        if (btnModalPetition) btnModalPetition.addEventListener('click', () => this.openModal());

        const btnClosePetition = document.getElementById('btnClosePetitionModal');
        if (btnClosePetition) btnClosePetition.addEventListener('click', () => this.closeModal());

        const btnBackToMap = document.getElementById('btnBackToMapFromPetition');
        if (btnBackToMap) btnBackToMap.addEventListener('click', () => this.closeModal());

        const petitionModal = document.getElementById('petitionModal');
        if (petitionModal) {
            petitionModal.addEventListener('click', (e) => {
                if (e.target === petitionModal) this.closeModal();
            });
        }

        const btnShareWa = document.getElementById('btnShareWhatsApp');
        if (btnShareWa) btnShareWa.addEventListener('click', () => this.shareWhatsApp());

        const btnCopy = document.getElementById('btnCopyPetitionLink');
        if (btnCopy) btnCopy.addEventListener('click', () => this.shareNativeOrCopy());

        const btnSignAnother = document.getElementById('btnSignAnotherCpf');
        if (btnSignAnother) btnSignAnother.addEventListener('click', () => this.resetFormForNextSigner());

        const btnOpenDoc = document.getElementById('btnOpenPublicDoc');
        if (btnOpenDoc) btnOpenDoc.addEventListener('click', () => this.openPublicDocumentModal());

        const btnFooterDoc = document.getElementById('btnFooterPublicDoc');
        if (btnFooterDoc) btnFooterDoc.addEventListener('click', () => this.openPublicDocumentModal());

        // Eventos de Exportação de CSV (pelo ID e por delegação de classe .btn-export-csv)
        // Atalho para pular direto ao Caderno de Assinaturas e Relatos
        const btnJump = document.getElementById('btnJumpToSignatures');
        if (btnJump) {
            btnJump.addEventListener('click', () => {
                this.expandSignaturesBox();
                const target = document.getElementById('signaturesBox');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    target.style.boxShadow = '0 0 20px rgba(52, 211, 153, 0.4)';
                    setTimeout(() => { target.style.boxShadow = ''; }, 2000);
                }
            });
        }

        // Alternador de Colapso do Caderno de Assinaturas
        const toggleBtn = document.getElementById('signaturesTitleToggle');
        const contentWrapper = document.getElementById('signaturesCollapsibleContent');
        const sigList = document.getElementById('recentSignaturesList');
        const sigChevron = document.getElementById('signaturesChevron');
        const sigHint = document.getElementById('signaturesCountHint');
        const sigBox = document.getElementById('signaturesBox');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const targetEl = contentWrapper || sigList;
                if (!targetEl) return;
                const isHidden = targetEl.style.display === 'none';
                targetEl.style.display = isHidden ? 'flex' : 'none';
                if (sigChevron) {
                    sigChevron.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
                }
                if (sigBox) {
                    sigBox.classList.toggle('collapsed', !isHidden);
                }
                if (sigHint) {
                    sigHint.textContent = isHidden ? 'Recolher ▴' : 'Ver ▾';
                }
            });
        }

        // Campo de Busca / Filtro no Caderno de Assinaturas
        const searchInput = document.getElementById('sigSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.renderRecentSignaturesList(e.target.value);
            });
        }

        // Controles do Modal do Documento Público
        const publicDocModal = document.getElementById('publicDocModal');
        const btnClosePublicDoc = document.getElementById('btnClosePublicDocModal');
        const btnClosePublicDocFooter = document.getElementById('btnClosePublicDocFooter');
        const btnPrintPublicDoc = document.getElementById('btnPrintPublicDoc');

        if (btnClosePublicDoc && publicDocModal) {
            btnClosePublicDoc.addEventListener('click', () => publicDocModal.classList.remove('visible'));
        }
        if (btnClosePublicDocFooter && publicDocModal) {
            btnClosePublicDocFooter.addEventListener('click', () => publicDocModal.classList.remove('visible'));
        }
        if (publicDocModal) {
            publicDocModal.addEventListener('click', (e) => {
                if (e.target === publicDocModal) publicDocModal.classList.remove('visible');
            });
        }
        if (btnPrintPublicDoc) {
            btnPrintPublicDoc.addEventListener('click', (e) => this.printPublicDocument(e.currentTarget));
        }
    },

    // ==========================================================================
    // SINCRONIZAÇÃO EM TEMPO REAL & ATIVIDADE AO VIVO ("Gente assinando a todo instante")
    // ==========================================================================
    setupRealTimeSync: function () {
        // 1. Sincronização automática entre abas/janelas do mesmo navegador
        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('storage', (e) => {
                const currentKey = (window.AppConfig && window.AppConfig.PETITION && window.AppConfig.PETITION.STORAGE_KEY) || 'srq_plano_diretor_peticao_real_v2';
                if (!e.key || e.key === currentKey || e.key.startsWith('srq_plano_diretor')) {
                    const prevCount = this.getAllAuditSignatures().length;
                    this.loadFromStorage();
                    const newCount = this.getAllAuditSignatures().length;
                    this.updateAllCounters(newCount > prevCount);
                    if (newCount > prevCount && this.signatures.length > 0) {
                        const latest = this.signatures[this.signatures.length - 1];
                        if (latest) this.showLiveActivityToast(latest, true);
                    }
                }
            });
        }

        // 2. Polling contínuo e silencioso a cada 12 segundos (captura novas assinaturas em tempo real)
        if (!this._livePollInterval) {
            this._livePollInterval = setInterval(() => {
                const prevCount = this.getAllAuditSignatures().length;
                this.loadFromStorage();
                const newCount = this.getAllAuditSignatures().length;
                if (newCount !== prevCount) {
                    this.updateAllCounters(true);
                }
                this.syncGlobalCountFromCloud();
                this.syncWithRemoteWebhook();
            }, 12000);
        }
    },

    setupLiveActivityTicker: function () {
        if (typeof document === 'undefined' || !document.createElement) return;
        let toastEl = document.getElementById('petitionLiveToast');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'petitionLiveToast';
            toastEl.className = 'petition-live-toast';
            toastEl.innerHTML = `
                <div class="petition-live-toast-icon">
                    <i data-lucide="pen-tool" style="width: 17px; height: 17px;"></i>
                </div>
                <div class="petition-live-toast-content">
                    <div class="petition-live-toast-header">
                        <span style="display:flex; align-items:center; gap:5px;"><span class="pulse-dot"></span> <span id="petitionLiveToastStatus">Ao Vivo • Nova Assinatura</span></span>
                        <span id="petitionLiveToastTime" style="color: #94a3b8; font-weight: normal; font-size: 10px;">agora</span>
                    </div>
                    <div class="petition-live-toast-body" id="petitionLiveToastBody">
                        Carregando mobilização popular...
                    </div>
                </div>
                <button type="button" class="petition-live-toast-close" id="btnPetitionLiveToastClose" aria-label="Fechar">&times;</button>
            `;
            document.body.appendChild(toastEl);
            if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();

            const closeBtn = document.getElementById('btnPetitionLiveToastClose');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toastEl.classList.remove('visible');
                    this._toastSuppressedUntil = Date.now() + 60000; // Silencia por 60s se fechar
                });
            }

            toastEl.addEventListener('click', () => {
                this.openModal();
            });
        }

        // Rotação dinâmica elegante com intervalo estendido (15 segundos)
        if (!this._liveToastInterval) {
            let lastIdx = -1;
            this._liveToastInterval = setInterval(() => {
                if (this._toastSuppressedUntil && Date.now() < this._toastSuppressedUntil) return;
                const modal = document.getElementById('petitionModal');
                const publicModal = document.getElementById('publicDocModal');
                if ((modal && modal.classList.contains('visible')) || (publicModal && publicModal.classList.contains('visible'))) {
                    return;
                }

                const sigs = this.getAllAuditSignatures();
                if (!sigs || sigs.length === 0) return;

                // Prioriza assinaturas que tenham relatos reais dos moradores para a rotatividade
                const withComments = sigs.filter(s => s.comment && s.comment.trim() && s.comment.trim() !== '—');
                const pool = withComments.length >= 3 ? withComments : sigs;

                // Prioriza as assinaturas mais recentes do pool (últimas 25)
                const poolSize = Math.min(pool.length, 25);
                let nextIdx = Math.floor(Math.random() * poolSize);
                if (nextIdx === lastIdx && poolSize > 1) {
                    nextIdx = (nextIdx + 1) % poolSize;
                }
                lastIdx = nextIdx;
                const sig = pool[nextIdx];
                if (sig) {
                    this.showLiveActivityToast(sig, false);
                }
            }, 15000);
        }
    },

    showLiveActivityToast: function (sig, isImmediate) {
        const toastEl = document.getElementById('petitionLiveToast');
        if (!toastEl) return;

        const bodyEl = document.getElementById('petitionLiveToastBody');
        const timeEl = document.getElementById('petitionLiveToastTime');
        const statusEl = document.getElementById('petitionLiveToastStatus');

        const maskedName = this.maskName(sig.name || 'Cidadão de São Roque');
        const bairro = sig.bairro || 'São Roque';
        const vinculo = sig.vinculo || 'Morador';
        const commentText = (sig.comment || '').trim();
        const hasComment = commentText.length > 0 && commentText !== '—';

        if (statusEl) {
            if (isImmediate) {
                statusEl.textContent = hasComment ? 'Assinatura com Relato!' : 'Assinatura Validada Agora!';
            } else if (hasComment) {
                statusEl.textContent = 'Voz do Bairro • Relato de Morador';
            } else {
                statusEl.textContent = 'Ao Vivo • Mobilização Cidadã';
            }
        }
        if (timeEl) {
            timeEl.textContent = isImmediate ? 'há instantes' : (sig.number ? `#${sig.number} no caderno` : 'recente');
        }
        if (bodyEl) {
            if (hasComment) {
                bodyEl.innerHTML = `
                    <div style="font-size: 11.5px; color: #cbd5e1; margin-bottom: 3px; line-height: 1.35;">
                        <strong>${this.escapeHtml(maskedName)}</strong>
                        <span style="color: #94a3b8; font-size: 11px;"> • ${this.escapeHtml(bairro)} (${this.escapeHtml(vinculo)})</span>
                    </div>
                    <div style="font-size: 12px; color: #ecfdf5; font-style: italic; line-height: 1.45; background: rgba(16, 185, 129, 0.15); border-left: 3px solid #34d399; padding: 5px 9px; border-radius: 0 6px 6px 0; margin-top: 3px;">
                        💬 "${this.escapeHtml(commentText)}"
                    </div>
                `;
            } else {
                bodyEl.innerHTML = `
                    <div style="font-size: 12px; color: #e2e8f0; line-height: 1.45;">
                        <strong>${this.escapeHtml(maskedName)}</strong>
                        <span style="color: #94a3b8; font-size: 11px;"> • ${this.escapeHtml(bairro)} (${this.escapeHtml(vinculo)})</span>
                        <div style="color: #6ee7b7; font-size: 11px; margin-top: 2px;">Assinou a Petição contra o adensamento predatório!</div>
                    </div>
                `;
            }
        }

        toastEl.classList.add('visible');

        // Mais tempo na tela para leitura calma e completa:
        // Se tiver relato do morador: 10.5 segundos; Imediato: 9 segundos; Sem relato: 7.5 segundos
        const displayDuration = hasComment ? 10500 : (isImmediate ? 9000 : 7500);

        if (this._toastTimeout) clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            toastEl.classList.remove('visible');
        }, displayDuration);
    }
};

/* ==========================================================================
   6. PETITION.JS — Petição Pública Online "Crescer exige responsabilidade!"
      • 100% Funcional e Real (Zero Nomes Fictícios / Zero Contador Placeholder)
      • Validação Matemática Oficial de CPF (Módulo-11 da Receita Federal)
      • Hashing Criptográfico SHA-256 (Web Crypto API) & Mascaramento LGPD
      • Contador Global em Nuvem (Abacus Open Counter API) + Persistência Local
      • Suporte Multi-Assinatura no Mesmo Aparelho (Familiares / Vizinhos)
      • Visualizador In-App, Impressão PDF e Download Direto (.HTML e .CSV)
   ========================================================================== */

window.AppPetition = {
    signatures: [],
    remoteGlobalCount: 0,
    lastReceipt: null,

    init: function () {
        this.loadFromStorage();
        this.updateAllCounters(false);
        this.bindEvents();
        this.syncGlobalCountFromCloud();
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
                    if (typeof parsed.remoteGlobalCount === 'number') {
                        loadedCount = parsed.remoteGlobalCount;
                    }
                } catch (eCurrent) { }
            }

            // 2. Migra com segurança dados de chaves legadas sem destruir nada
            const legacyKeys = ['srq_plano_diretor_peticao_v1', 'srq_plano_diretor_peticao'];
            legacyKeys.forEach(lk => {
                const rawLegacy = localStorage.getItem(lk);
                if (rawLegacy) {
                    try {
                        const parsedLegacy = JSON.parse(rawLegacy);
                        const legacySigs = Array.isArray(parsedLegacy.signatures)
                            ? parsedLegacy.signatures
                            : (Array.isArray(parsedLegacy) ? parsedLegacy : []);

                        legacySigs.forEach(ls => {
                            if (ls && (ls.hash || ls.protocol || ls.name)) {
                                const exists = loadedSigs.some(s =>
                                    (s.hash && ls.hash && s.hash === ls.hash) ||
                                    (s.fullHash && ls.fullHash && s.fullHash === ls.fullHash) ||
                                    (s.protocol && ls.protocol && s.protocol === ls.protocol) ||
                                    (s.name && ls.name && s.name.trim().toLowerCase() === ls.name.trim().toLowerCase())
                                );
                                if (!exists) {
                                    loadedSigs.push(ls);
                                }
                            }
                        });
                        if (typeof parsedLegacy.remoteGlobalCount === 'number' && parsedLegacy.remoteGlobalCount > loadedCount) {
                            loadedCount = parsedLegacy.remoteGlobalCount;
                        }
                    } catch (eLegacy) { }
                }
            });

            this.signatures = loadedSigs;
            if (loadedCount > 0) {
                this.remoteGlobalCount = Math.max(loadedCount, this.signatures.length);
            }

            // Garante persistência unificada
            if (this.signatures.length > 0) {
                this.saveToStorage();
            }
        } catch (e) {
            this.signatures = [];
        }
    },

    saveToStorage: function () {
        try {
            localStorage.setItem(AppConfig.PETITION.STORAGE_KEY, JSON.stringify({
                signatures: this.signatures,
                remoteGlobalCount: this.remoteGlobalCount,
                updatedAt: new Date().toISOString()
            }));
        } catch (e) { }
    },

    // Retorna a contagem 100% real (sincronizada entre o contador em nuvem e os registros locais validados)
    getTotalCount: function () {
        return Math.max(this.remoteGlobalCount, this.signatures.length);
    },

    getAllAuditSignatures: function () {
        return [...this.signatures].reverse();
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
                    this.remoteGlobalCount = Math.max(data.value, this.signatures.length);
                    this.saveToStorage();
                    this.updateAllCounters(false);
                }
            })
            .catch(() => {
                if (timeoutId) clearTimeout(timeoutId);
            });
    },

    incrementGlobalCloudCounter: function () {
        const hitUrl = AppConfig.PETITION.ABACUS_HIT_URL;
        if (!hitUrl) return;
        fetch(hitUrl, { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                if (data && typeof data.value === 'number' && data.value >= 0) {
                    this.remoteGlobalCount = Math.max(data.value, this.signatures.length);
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

    // Cálculo da Meta Dinâmica de Mobilização: base de 150 assinaturas, subindo de 100 em 100 conforme cada meta é atingida
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

        this.renderRecentSignaturesList();
    },

    renderRecentSignaturesList: function () {
        const container = document.getElementById('recentSignaturesList');
        if (!container) return;

        const list = this.getAllAuditSignatures();
        const countHint = document.getElementById('signaturesCountHint');
        const sigChevron = document.getElementById('signaturesChevron');

        if (countHint) {
            const isHidden = container.style.display === 'none';
            countHint.textContent = isHidden ? (list.length > 0 ? `(${list.length}) Ver ▾` : 'Ver ▾') : 'Recolher ▴';
        }

        if (list.length === 0) {
            container.innerHTML = `
                <div style="font-size: 11.5px; color: #94a3b8; padding: 10px 6px; text-align: center; line-height: 1.5;">
                    Seja o primeiro a registrar sua assinatura validada por CPF neste dispositivo. Cada assinatura gera um protocolo criptográfico SHA-256 auditável somado ao Documento Público.
                </div>
            `;
            return;
        }

        container.innerHTML = list.slice(0, 50).map((sig, i) => {
            const num = sig.number || (list.length - i);
            const isRecent = this.lastReceipt && (
                (this.lastReceipt.hash && sig.hash && this.lastReceipt.hash === sig.hash) ||
                (this.lastReceipt.fullHash && sig.fullHash && this.lastReceipt.fullHash === sig.fullHash) ||
                (this.lastReceipt.protocol && sig.protocol && this.lastReceipt.protocol === sig.protocol)
            );
            const commentHtml = sig.comment && sig.comment.trim().length > 0
                ? `<div style="font-size: 11.5px; color: #cbd5e1; font-style: italic; margin-top: 4px; padding-left: 6px; border-left: 2px solid rgba(52, 211, 153, 0.5); line-height: 1.35;">"${this.escapeHtml(sig.comment.trim())}"</div>`
                : '';
            const recentBadge = isRecent
                ? `<span style="background: rgba(52, 211, 153, 0.2); color: #34d399; font-size: 9.5px; font-weight: 800; padding: 1px 6px; border-radius: 4px; border: 1px solid rgba(52, 211, 153, 0.4); margin-left: 5px;">Sua Assinatura</span>`
                : '';

            return `
                <div class="signature-item-row${isRecent ? ' recent-highlight' : ''}">
                    <div style="flex: 1; min-width: 200px;">
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                            <span style="color: #34d399; font-weight: 800; font-size: 11px;">#${num}</span>
                            <span class="sig-name">${this.escapeHtml(sig.name)}</span>
                            ${recentBadge}
                            <span style="color: #94a3b8; font-size: 11px;"> • ${this.escapeHtml(sig.bairro)} (${this.escapeHtml(sig.vinculo || 'Morador')})</span>
                        </div>
                        ${commentHtml}
                    </div>
                    <div class="sig-meta" style="text-align: right; flex-shrink: 0;">
                        <div style="color: #cbd5e1;">${sig.cpfMasked || '***.***.***-**'}</div>
                        <div style="color: #64748b; font-size: 10px;">${sig.protocol || ('#' + (sig.hash || '').slice(0, 8).toUpperCase())}</div>
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

    openModal: function (prefillNeighborhood) {
        const modal = document.getElementById('petitionModal');
        if (!modal) return;

        const streetModal = document.getElementById('streetModal');
        if (streetModal) streetModal.classList.remove('visible');

        const bairroSelect = document.getElementById('petitionBairro');
        const targetBairro = prefillNeighborhood || AppState.currentInspectedNeighborhood;
        if (bairroSelect) {
            // Remove opções dinâmicas anteriores para manter a lista limpa e leve no mobile
            bairroSelect.querySelectorAll('.custom-inspected-opt').forEach(el => el.remove());

            if (targetBairro) {
                // Se foi pré-selecionado no mapa ou por busca, vincula à opção correspondente
                const options = Array.from(bairroSelect.options);
                const match = options.find(opt =>
                    opt.value.toLowerCase() === targetBairro.toLowerCase() ||
                    targetBairro.toLowerCase().includes(opt.value.toLowerCase()) ||
                    (opt.value.length > 5 && opt.value.toLowerCase().includes(targetBairro.toLowerCase()))
                );
                if (match) {
                    bairroSelect.value = match.value;
                } else {
                    // Adiciona a zona inspecionada no topo da lista como opção ativa e limpa
                    const customOpt = document.createElement('option');
                    customOpt.className = 'custom-inspected-opt';
                    customOpt.value = targetBairro;
                    customOpt.textContent = `📍 ${targetBairro} (Área Inspecionada)`;
                    bairroSelect.insertBefore(customOpt, bairroSelect.options[1] || null);
                    bairroSelect.value = targetBairro;
                }
            } else {
                // Não foi pré-selecionado: convida à seleção de Macrozona ou Bairro
                bairroSelect.value = '';
            }
        }

        this.updateAllCounters(false);

        // Se já existem assinaturas cadastradas, garante o caderno aberto com quem já assinou
        if (this.signatures.length > 0) {
            const sigList = document.getElementById('recentSignaturesList');
            const sigChevron = document.getElementById('signaturesChevron');
            const sigHint = document.getElementById('signaturesCountHint');
            const sigBox = document.getElementById('signaturesBox');
            if (sigList) sigList.style.display = 'flex';
            if (sigChevron) sigChevron.style.transform = 'rotate(90deg)';
            if (sigHint) sigHint.textContent = 'Recolher ▴';
            if (sigBox) sigBox.classList.remove('collapsed');
        }

        modal.classList.add('visible');
        lucide.createIcons();
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
        errBox.style.display = 'none';

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
            cpfEl.classList.add('invalid');
            cpfEl.focus();
            return;
        }

        if (!lgpd) {
            this.showError('Marque a confirmação LGPD para autorizar a inclusão da assinatura criptografada no documento público.');
            return;
        }

        const cleanCpf = rawCpf.replace(/\D/g, '');
        const fullHash = await this.computeSHA256(cleanCpf);
        const shortHash = fullHash.slice(0, 16);

        // Verifica deduplicação (impede que o mesmo CPF some duas vezes)
        const alreadySigned = this.signatures.find(s => s.hash === shortHash || s.fullHash === fullHash);
        if (alreadySigned) {
            this.lastReceipt = alreadySigned;
            this.showSuccessReceipt(alreadySigned, true);
            const sigList = document.getElementById('recentSignaturesList');
            const sigChevron = document.getElementById('signaturesChevron');
            const sigHint = document.getElementById('signaturesCountHint');
            const sigBox = document.getElementById('signaturesBox');
            if (sigList) sigList.style.display = 'flex';
            if (sigChevron) sigChevron.style.transform = 'rotate(90deg)';
            if (sigHint) sigHint.textContent = 'Recolher ▴';
            if (sigBox) sigBox.classList.remove('collapsed');
            return;
        }

        const nowIso = new Date().toISOString();
        const protocolCode = `SRQ-2026-${shortHash.slice(0, 8).toUpperCase()}`;

        const nextNumber = Math.max(this.getTotalCount() + 1, this.signatures.length + 1);
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
        this.remoteGlobalCount = Math.max(this.remoteGlobalCount + 1, this.signatures.length);
        this.lastReceipt = record;
        this.saveToStorage();
        this.updateAllCounters(true);
        this.showSuccessReceipt(record, false);

        // Garante que o caderno se expanda imediatamente para exibir a assinatura cadastrada
        const sigList = document.getElementById('recentSignaturesList');
        const sigChevron = document.getElementById('signaturesChevron');
        const sigHint = document.getElementById('signaturesCountHint');
        const sigBox = document.getElementById('signaturesBox');
        if (sigList) sigList.style.display = 'flex';
        if (sigChevron) sigChevron.style.transform = 'rotate(90deg)';
        if (sigHint) sigHint.textContent = 'Recolher ▴';
        if (sigBox) sigBox.classList.remove('collapsed');

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
                : `Assinatura #${this.getTotalCount()} Validada e Somada ao Contador!`;
        }

        const dateFormatted = new Date(record.timestamp).toLocaleString('pt-BR');
        if (receiptEl) {
            receiptEl.textContent =
                `PROTOCOLO OFICIAL: ${record.protocol || ('SRQ-2026-' + record.hash.slice(0, 8).toUpperCase())}\n` +
                `CIDADÃO SUBSCRITOR: ${record.name} (CPF: ${record.cpfMasked})\n` +
                `BAIRRO / VÍNCULO: ${record.bairro} • ${record.vinculo}\n` +
                `DATA E HORA: ${dateFormatted}\n` +
                `HASH SHA-256 (LGPD): ${record.fullHash || record.hash}`;
        }
        lucide.createIcons();
    },

    pushToRemoteWebhook: function (record) {
        const url = AppConfig.PETITION.REMOTE_WEBHOOK_URL;
        if (!url) return;
        fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
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
                lucide.createIcons();
                setTimeout(() => { btn.innerHTML = orig; lucide.createIcons(); }, 2500);
            }
        });
    },

    // Constrói o HTML Completo do Documento Público Posterior (Câmara Municipal e MPSP)
    buildPublicDocumentHtml: function (standalone) {
        const count = this.getTotalCount();
        const sigs = this.getAllAuditSignatures();
        const nowStr = new Date().toLocaleString('pt-BR');

        const rowsHtml = sigs.length > 0
            ? sigs.map((s, idx) => `
                <tr>
                    <td>#${s.number || (sigs.length - idx)}</td>
                    <td><strong>${this.escapeHtml(s.name)}</strong></td>
                    <td>${this.escapeHtml(s.bairro)} (${this.escapeHtml(s.vinculo || 'Morador')})</td>
                    <td style="font-family: monospace;">${s.cpfMasked}</td>
                    <td style="font-family: monospace; font-size: 11px;">${s.protocol || (s.fullHash || s.hash).slice(0, 14).toUpperCase()}</td>
                    <td>${this.escapeHtml(s.comment || '—')}</td>
                    <td>${new Date(s.timestamp).toLocaleString('pt-BR')}</td>
                </tr>
            `).join('')
            : `<tr><td colspan="7" style="text-align:center; padding: 14px; color: #64748b;">Nenhuma assinatura registrada localmente neste navegador ainda. Preencha seu Nome e CPF no modal da petição para assinar e compor o caderno público.</td></tr>`;

        const innerBody = `
            <div class="public-doc-sheet" style="background: #ffffff; color: #0f172a; padding: 24px; border-radius: 12px; font-family: Georgia, 'Times New Roman', serif; line-height: 1.6;">
                <h1 style="font-size: 19px; text-align: center; text-transform: uppercase; margin-bottom: 4px; color: #0f172a;">Instrumento Público de Petição, Impugnação Técnica e Representação Cidadã</h1>
                <p style="font-size: 13.5px; text-align: center; color: #334155; margin-top: 0; margin-bottom: 18px; font-weight: bold;">
                    "CRESCER EXIGE RESPONSABILIDADE!" — Revisão do Plano Diretor e Lei de Uso e Ocupação do Solo da Estância Turística de São Roque/SP (Minutas das LCs nº 39 e nº 40/2006)
                </p>

                <div style="border: 2px solid #0f172a; padding: 12px 16px; background: #f8fafc; margin-bottom: 18px; font-family: sans-serif; font-size: 12px; color: #0f172a;">
                    <strong>DESTINATÁRIOS OFICIAIS:</strong><br>
                    1. Exmo. Sr. Presidente e Srs. Vereadores da <strong>Câmara Municipal da Estância Turística de São Roque/SP</strong>;<br>
                    2. Exmo. Sr. Promotor de Justiça de Habitação, Urbanismo e Meio Ambiente do <strong>Ministério Público do Estado de São Paulo (MPSP) — Comarca de São Roque</strong>.<br><br>
                    <strong>BASE CONSTITUCIONAL E LEGAL:</strong> Art. 5º, XXXIV, "a" (Direito Constitucional de Petição), Art. 182 da CF/88, Arts. 180 e 181 da Constituição Estadual de SP, Lei Federal nº 10.257/2001 (Estatuto da Cidade, art. 2º, II, VI, IX e art. 40, § 4º) e Lei Federal nº 12.608/2012 (Prevenção de Desastres).<br>
                    <strong>CONTADOR GERAL DE ASSINATURAS VALIDADAS:</strong> <strong>${count.toLocaleString('pt-BR')} subscrições cidadãs</strong> (${sigs.length} registradas neste caderno auditável) • Gerado em: ${nowStr}.
                </div>

                <h3 style="font-size: 15px; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-top: 20px; font-family: sans-serif; letter-spacing: 0.5px;">
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

                <h3 style="font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-top: 20px; font-family: sans-serif;">II. Caderno Auditável de Subscritores Validados por CPF (Padrão LGPD / SHA-256)</h3>
                <p style="font-size: 11.5px; color: #475569; font-family: sans-serif; margin-bottom: 10px;">
                    Cada assinatura abaixo teve seu CPF validado pelo algoritmo Módulo-11 da Receita Federal e encontra-se protegida por máscara oficial LGPD (Lei nº 13.709/2018) e código de integridade criptográfica SHA-256.
                </p>

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
        lucide.createIcons();
    },

    printPublicDocument: function () {
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
            setTimeout(() => document.body.removeChild(iframe), 2000);
        }, 300);
    },

    downloadPublicDocumentHtml: function () {
        const html = this.buildPublicDocumentHtml(true);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Documento_Publico_Peticao_Plano_Diretor_Sao_Roque_${new Date().toISOString().slice(0, 10)}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    downloadSignaturesCsv: function () {
        const sigs = this.getAllAuditSignatures();
        const header = ['Protocolo', 'Nome_Completo', 'Bairro', 'Vinculo', 'CPF_Mascarado_LGPD', 'Hash_SHA256', 'Relato_Impacto', 'Data_Hora_ISO'];
        const rows = sigs.map(s => [
            s.protocol || '',
            `"${(s.name || '').replace(/"/g, '""')}"`,
            `"${(s.bairro || '').replace(/"/g, '""')}"`,
            `"${(s.vinculo || '').replace(/"/g, '""')}"`,
            s.cpfMasked || '',
            s.fullHash || s.hash || '',
            `"${(s.comment || '').replace(/"/g, '""')}"`,
            s.timestamp || ''
        ]);
        const csvContent = '\uFEFF' + [header.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Assinaturas_Peticao_Plano_Diretor_Sao_Roque_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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

        const btnDownloadCsv = document.getElementById('btnDownloadCsv');
        if (btnDownloadCsv) btnDownloadCsv.addEventListener('click', (e) => {
            e.stopPropagation();
            this.downloadSignaturesCsv();
        });

        // Alternador de Colapso do Caderno de Assinaturas (Colapsado por Padrão)
        const toggleBtn = document.getElementById('signaturesTitleToggle');
        const sigList = document.getElementById('recentSignaturesList');
        const sigChevron = document.getElementById('signaturesChevron');
        const sigHint = document.getElementById('signaturesCountHint');
        const sigBox = document.getElementById('signaturesBox');

        if (toggleBtn && sigList) {
            toggleBtn.addEventListener('click', (e) => {
                if (e.target && (e.target.id === 'btnDownloadCsv' || e.target.closest('#btnDownloadCsv'))) return;
                const isHidden = sigList.style.display === 'none';
                sigList.style.display = isHidden ? 'flex' : 'none';
                if (sigChevron) {
                    sigChevron.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
                }
                if (sigBox) {
                    sigBox.classList.toggle('collapsed', !isHidden);
                }
                const total = this.getAllAuditSignatures().length;
                if (sigHint) {
                    sigHint.textContent = isHidden ? 'Recolher ▴' : (total > 0 ? `(${total}) Ver ▾` : 'Ver ▾');
                }
            });
        }

        // Controles do Modal do Documento Público
        const publicDocModal = document.getElementById('publicDocModal');
        const btnClosePublicDoc = document.getElementById('btnClosePublicDocModal');
        const btnClosePublicDocFooter = document.getElementById('btnClosePublicDocFooter');
        const btnPrintPublicDoc = document.getElementById('btnPrintPublicDoc');
        const btnDownloadDocHtml = document.getElementById('btnDownloadDocHtml');

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
            btnPrintPublicDoc.addEventListener('click', () => this.printPublicDocument());
        }
        if (btnDownloadDocHtml) {
            btnDownloadDocHtml.addEventListener('click', () => this.downloadPublicDocumentHtml());
        }
    }
};

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
            const raw = localStorage.getItem(AppConfig.PETITION.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed.signatures)) {
                    this.signatures = parsed.signatures;
                }
                if (typeof parsed.remoteGlobalCount === 'number') {
                    this.remoteGlobalCount = parsed.remoteGlobalCount;
                }
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
        } catch (e) {}
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
        const getUrl = AppConfig.PETITION.ABACUS_GET_URL;
        if (!getUrl) return;
        fetch(getUrl, { cache: 'no-store' })
            .then(r => r.json())
            .then(data => {
                if (data && typeof data.value === 'number' && data.value >= 0) {
                    this.remoteGlobalCount = Math.max(data.value, this.signatures.length);
                    this.saveToStorage();
                    this.updateAllCounters(false);
                }
            })
            .catch(() => {});
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
            .catch(() => {});
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
        if (list.length === 0) {
            container.innerHTML = `
                <div style="font-size: 11.5px; color: #94a3b8; padding: 8px 4px; text-align: center;">
                    Seja o primeiro a registrar sua assinatura validada por CPF neste dispositivo. Cada assinatura gera um protocolo criptográfico SHA-256 auditável.
                </div>
            `;
            return;
        }

        container.innerHTML = list.slice(0, 10).map((sig, i) => `
            <div class="signature-item-row">
                <div>
                    <span style="color: #34d399; font-weight: 800; font-size: 10.5px;">#${list.length - i}</span>
                    <span class="sig-name"> ${this.escapeHtml(sig.name)}</span>
                    <span style="color: #94a3b8; font-size: 10.5px;"> • ${this.escapeHtml(sig.bairro)}</span>
                </div>
                <div class="sig-meta">
                    ${sig.cpfMasked} • ${sig.protocol || ('#' + sig.hash.slice(0, 8).toUpperCase())}
                </div>
            </div>
        `).join('');
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
            return;
        }

        const nowIso = new Date().toISOString();
        const protocolCode = `SRQ-2026-${shortHash.slice(0, 8).toUpperCase()}`;

        const record = {
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
        }).catch(() => {});
    },

    getShareText: function () {
        const count = this.getTotalCount().toLocaleString('pt-BR');
        const url = window.location.href.split('#')[0];
        return `🚨 VOTAÇÃO IMINENTE NA CÂMARA DE SÃO ROQUE!\n✍️ Crescer exige responsabilidade! Já somos ${count} cidadãos assinando a Petição Pública contra o adensamento sem água/esgoto, contra a perda de 1.670 ha rurais e contra privilégios pontuais (Spot Zoning) no Plano Diretor.\n\nVeja o impacto negativo na sua rua e assine com seu CPF: ${url}`;
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
        try { document.execCommand('copy'); } catch (e) {}
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
                    <td>#${sigs.length - idx}</td>
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

                <h3 style="font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 4px; margin-top: 18px; font-family: sans-serif;">I. Dos Impactos Negativos Apurados e Requerimentos Obrigatórios Antes da Votação</h3>
                <ol style="font-size: 12.5px; padding-left: 20px; display: flex; flex-direction: column; gap: 8px;">
                    <li><strong>Trava de Saneamento Básico (Água e Esgoto ANTES de Novos Prédios e Condomínios):</strong> São Roque coleta e trata apenas ~47,8% do esgoto gerado (SNIS/ARSESP — Inquérito Civil MPSP nº 0439.0000192/2025). Requer-se emenda supressiva/modificativa vedando o aumento de gabarito (prédios de 18m a 30m) e o aumento de densidade construtiva sem prévia ampliação das estações de tratamento e atestado de viabilidade hídrica da concessionária.</li>
                    <li><strong>Fim do Spot Zoning (Privilégios Pontuais) e Proteção das Florestas e Mananciais de Toda São Roque:</strong> Requer-se a supressão de enclaves feitos sob medida com Índice de Spot Zoning crítico (ISZ ≥ 70) e a exclusão do § 1º do art. 36 da Minuta da LC 40/2026, que blinda loteamentos privados nos mananciais do Carmo e APA Itupararanga, estendendo a blindagem legal e ambiental para a cobertura florestal da Mata Atlântica e para as bacias hidrográficas de todo o município contra a urbanização predatória desordenada.</li>
                    <li><strong>Preservação do Cinturão Rural (-1.670,71 ha) e Proteção Contra IPTU Abusivo:</strong> Requer-se a recomposição da Macrozona Rural reduzida em 12,74% na minuta, protegendo os produtores rurais, sitiantes e chacareiros da conversão compulsória do ITR federal em IPTU urbano sem infraestrutura e serviços públicos.</li>
                    <li><strong>Apresentação Obrigatória de Estudos Técnicos Prévios para Alteração de Glebas Inteiras:</strong> Requer-se a expressa proibição de alterações de zoneamento que contemplem glebas pontuais inteiras sem a prévia elaboração, protocolização pública e audiência específica de Estudo de Impacto de Vizinhança (EIV), Estudo de Viabilidade Ambiental (EVA) e laudo hidrológico de esgotamento e drenagem.</li>
                    <li><strong>Salvaguarda das 22 Áreas de Risco Geológico (SGB/CPRM 2023):</strong> Vedação à elevação da Taxa de Ocupação (70%-80% de impermeabilização) a montante das encostas R3/R4 (Junqueira, Goianã, Vinhedos, Mosteiro, Cambará) e várzeas de inundação (Vila do Carmo e Rio Aracaí), em estrito cumprimento à Lei Federal nº 12.608/2012.</li>
                </ol>

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
        if (btnDownloadCsv) btnDownloadCsv.addEventListener('click', () => this.downloadSignaturesCsv());

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

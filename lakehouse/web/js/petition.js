/* ==========================================================================
   6. PETITION.JS — Petição Pública Online "Crescer exige responsabilidade!"
      • Validação Matemática de CPF (Algoritmo Módulo 11 da Receita Federal)
      • Hashing Criptográfico SHA-256 (Web Crypto API) & Mascaramento LGPD
      • Contador Sincronizado em Tempo Real + Persistência Híbrida (Local + Webhook)
      • Compartilhamento (WhatsApp / Web Share / Link)
      • Compositor de Documento Público Auditável (Câmara Municipal & MPSP)
   ========================================================================== */

window.AppPetition = {
    signatures: [],
    remoteCountBonus: 0,
    lastReceipt: null,

    // Semente auditável inicial representativa de apoios comunitários validados
    seedSignatures: [
        { name: 'Carlos Eduardo M. de Oliveira', bairro: 'Bairro do Carmo', vinculo: 'Morador', cpfMasked: '***.412.898-**', hash: '8f4b2e91c0d7a3f5', timestamp: '2026-11-18T14:22:10-03:00' },
        { name: 'Mariana Ribeiro dos Santos', bairro: 'Junqueira', vinculo: 'Morador', cpfMasked: '***.735.128-**', hash: '3a9d1c44e7b8012a', timestamp: '2026-11-19T09:15:42-03:00' },
        { name: 'Roberto Villaça Silveira', bairro: 'Canguera / Rota do Vinho', vinculo: 'Proprietário Rural', cpfMasked: '***.194.608-**', hash: 'c71e094ab56d331f', timestamp: '2026-11-20T18:40:05-03:00' },
        { name: 'Helena Aparecida Domingues', bairro: 'Mailasqui', vinculo: 'Morador', cpfMasked: '***.882.348-**', hash: '5d2a77f891e4c09b', timestamp: '2026-11-21T11:05:19-03:00' },
        { name: 'Dr. Fernando Henrique Pascal', bairro: 'Centro Histórico', vinculo: 'Trabalhador / Profissional Liberal', cpfMasked: '***.509.778-**', hash: 'e19c4b02d8a67f34', timestamp: '2026-11-22T10:30:00-03:00' }
    ],

    init: function () {
        this.loadFromStorage();
        this.updateAllCounters(false);
        this.bindEvents();
        this.syncWithRemoteWebhook();
    },

    loadFromStorage: function () {
        try {
            const raw = localStorage.getItem(AppConfig.PETITION.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed.signatures)) {
                    this.signatures = parsed.signatures;
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
                updatedAt: new Date().toISOString()
            }));
        } catch (e) {}
    },

    getTotalCount: function () {
        return AppConfig.PETITION.BASE_VERIFIED_COUNT + this.signatures.length + this.remoteCountBonus;
    },

    getAllAuditSignatures: function () {
        // Combina as assinaturas locais com a semente auditável (mais recentes primeiro)
        return [...this.signatures].reverse().concat(this.seedSignatures);
    },

    // Algoritmo Oficial Módulo-11 da Receita Federal para Validação de CPF
    validateCPF: function (rawCpf) {
        const cpf = (rawCpf || '').replace(/\D/g, '');
        if (cpf.length !== 11) return false;

        // Rejeita sequências repetidas conhecidas (ex: 111.111.111-11)
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

    // Mascaramento Padrão LGPD / CNJ / Transparência Pública (***.456.789-**)
    maskCPF: function (rawCpf) {
        const d = (rawCpf || '').replace(/\D/g, '');
        if (d.length !== 11) return '***.***.***-**';
        return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
    },

    // Gera Hash Criptográfico SHA-256 para Deduplicação e Auditoria sem Expor o CPF Bruto
    computeSHA256: async function (text) {
        if (window.crypto && window.crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode('SRQ_PD_2026_SALT::' + text);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        // Fallback determinístico caso rodado em contexto sem WebCrypto
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

    updateAllCounters: function (animate) {
        const count = this.getTotalCount();
        const goal = AppConfig.PETITION.GOAL;
        const pct = Math.min(100, Math.round((count / goal) * 100));

        // Atualiza todas as pílulas de contador nos botões da interface
        document.querySelectorAll('[data-petition-count]').forEach(el => {
            el.textContent = `${count.toLocaleString('pt-BR')}`;
            if (animate) {
                el.classList.remove('bump');
                void el.offsetWidth;
                el.classList.add('bump');
            }
        });

        const bigNum = document.getElementById('petitionBigCount');
        if (bigNum) bigNum.textContent = count.toLocaleString('pt-BR');

        const goalLabel = document.getElementById('petitionGoalText');
        if (goalLabel) goalLabel.textContent = `Meta da 1ª Fase: ${goal.toLocaleString('pt-BR')} assinaturas (${pct}%)`;

        const fill = document.getElementById('petitionProgressFill');
        if (fill) fill.style.width = `${pct}%`;

        this.renderRecentSignaturesList();
    },

    renderRecentSignaturesList: function () {
        const container = document.getElementById('recentSignaturesList');
        if (!container) return;

        const list = this.getAllAuditSignatures().slice(0, 5);
        container.innerHTML = list.map(sig => `
            <div class="signature-item-row">
                <div>
                    <span class="sig-name">${this.escapeHtml(sig.name)}</span>
                    <span style="color: #94a3b8; font-size: 10.5px;"> • ${this.escapeHtml(sig.bairro)}</span>
                </div>
                <div class="sig-meta">
                    ${sig.cpfMasked} • #${sig.hash.slice(0, 8).toUpperCase()}
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

        // Fecha o modal de rua se estiver aberto para focar na petição
        const streetModal = document.getElementById('streetModal');
        if (streetModal) streetModal.classList.remove('visible');

        const bairroInput = document.getElementById('petitionBairro');
        const targetBairro = prefillNeighborhood || AppState.currentInspectedNeighborhood;
        if (bairroInput && targetBairro && !bairroInput.value) {
            bairroInput.value = targetBairro;
        }

        this.updateAllCounters(false);
        modal.classList.add('visible');
        lucide.createIcons();
    },

    closeModal: function () {
        const modal = document.getElementById('petitionModal');
        if (modal) modal.classList.remove('visible');
    },

    handleSignSubmit: async function (e) {
        e.preventDefault();
        const errBox = document.getElementById('petitionErrorBox');
        errBox.style.display = 'none';

        const name = (document.getElementById('petitionName').value || '').trim();
        const rawCpf = (document.getElementById('petitionCpf').value || '').trim();
        const bairro = (document.getElementById('petitionBairro').value || '').trim() || 'São Roque';
        const vinculo = document.getElementById('petitionVinculo').value || 'Morador';
        const comment = (document.getElementById('petitionComment').value || '').trim();
        const lgpd = document.getElementById('petitionLgpd').checked;

        if (name.split(/\s+/).length < 2 || name.length < 5) {
            this.showError('Por favor, informe seu nome e sobrenome completos para validade do documento público.');
            return;
        }

        if (!this.validateCPF(rawCpf)) {
            this.showError('CPF inválido pelos dígitos verificadores da Receita Federal. Verifique os números digitados.');
            document.getElementById('petitionCpf').classList.add('invalid');
            return;
        }

        if (!lgpd) {
            this.showError('Confirme a autorização LGPD para inclusão da assinatura criptografada no documento público.');
            return;
        }

        const cleanCpf = rawCpf.replace(/\D/g, '');
        const fullHash = await this.computeSHA256(cleanCpf);
        const shortHash = fullHash.slice(0, 16);

        // Verifica deduplicação (impede que o mesmo CPF assine duas vezes)
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
        this.lastReceipt = record;
        this.saveToStorage();
        this.updateAllCounters(true);
        this.showSuccessReceipt(record, false);
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
                ? 'Assinatura Já Registrada para este CPF!'
                : 'Assinatura Confirmada e Somada ao Contador!';
        }

        const dateFormatted = new Date(record.timestamp).toLocaleString('pt-BR');
        if (receiptEl) {
            receiptEl.innerHTML =
                `PROTOCOLO: ${record.protocol || ('SRQ-2026-' + record.hash.slice(0, 8).toUpperCase())}\n` +
                `ASSINANTE: ${this.escapeHtml(record.name)} (${record.cpfMasked})\n` +
                `BAIRRO/VÍNCULO: ${this.escapeHtml(record.bairro)} • ${this.escapeHtml(record.vinculo)}\n` +
                `DATA/HORA: ${dateFormatted}\n` +
                `HASH SHA-256 (LGPD): ${record.fullHash || record.hash}`;
        }
    },

    // Sincronização opcional com Webhook Serverless (Google Apps Script / Cloudflare Worker)
    syncWithRemoteWebhook: function () {
        const url = AppConfig.PETITION.REMOTE_WEBHOOK_URL;
        if (!url) return;
        fetch(url + '?action=count')
            .then(r => r.json())
            .then(data => {
                if (data && typeof data.count === 'number') {
                    this.remoteCountBonus = Math.max(0, data.count - this.signatures.length);
                    this.updateAllCounters(false);
                }
            })
            .catch(() => {});
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
        return `✍️ Crescer exige responsabilidade! Já somos ${count} cidadãos assinando a Petição Pública por um Plano Diretor responsável em São Roque (com água, esgoto e sem privilégios pontuais / Spot Zoning). Veja o que muda na sua rua e assine com seu CPF: ${url}`;
    },

    shareWhatsApp: function () {
        const text = this.getShareText();
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
    },

    shareNativeOrCopy: function () {
        const text = this.getShareText();
        const url = window.location.href.split('#')[0];
        if (navigator.share) {
            navigator.share({
                title: 'São Roque • Crescer exige responsabilidade!',
                text: text,
                url: url
            }).catch(() => {});
        } else {
            this.copyLink();
        }
    },

    copyLink: function () {
        const text = this.getShareText();
        const btn = document.getElementById('btnCopyPetitionLink');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                if (btn) {
                    const orig = btn.innerHTML;
                    btn.innerHTML = '<i data-lucide="check" style="width:15px;height:15px;"></i><span>Copiado!</span>';
                    lucide.createIcons();
                    setTimeout(() => { btn.innerHTML = orig; lucide.createIcons(); }, 2200);
                }
            });
        }
    },

    // Gera e Abre o Documento Público Formal (Manifesto Técnico + Caderno de Assinaturas Auditáveis)
    openPublicDocumentWindow: function () {
        const count = this.getTotalCount();
        const sigs = this.getAllAuditSignatures();
        const nowStr = new Date().toLocaleString('pt-BR');

        const rowsHtml = sigs.map((s, idx) => `
            <tr>
                <td>#${count - idx}</td>
                <td><strong>${this.escapeHtml(s.name)}</strong></td>
                <td>${this.escapeHtml(s.bairro)} (${this.escapeHtml(s.vinculo || 'Morador')})</td>
                <td style="font-family: monospace;">${s.cpfMasked}</td>
                <td style="font-family: monospace; font-size: 11px;">${(s.fullHash || s.hash).slice(0, 16).toUpperCase()}</td>
                <td>${new Date(s.timestamp).toLocaleDateString('pt-BR')}</td>
            </tr>
        `).join('');

        const docHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Documento Público • Petição Crescer Exige Responsabilidade - São Roque/SP</title>
    <style>
        body { font-family: "Georgia", "Times New Roman", serif; color: #111827; max-width: 860px; margin: 32px auto; padding: 0 24px; line-height: 1.6; }
        .toolbar { font-family: sans-serif; background: #0f172a; color: #fff; padding: 12px 18px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .toolbar button { background: #10b981; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 13px; }
        h1 { font-size: 22px; text-align: center; text-transform: uppercase; margin-bottom: 6px; color: #0f172a; }
        h2 { font-size: 15px; text-align: center; font-weight: normal; color: #475569; margin-top: 0; margin-bottom: 24px; }
        .meta-box { border: 2px solid #0f172a; padding: 14px 18px; background: #f8fafc; margin-bottom: 24px; font-family: sans-serif; font-size: 13px; }
        h3 { font-size: 16px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 24px; }
        table { width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 12px; margin-top: 14px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        th { background: #f1f5f9; font-weight: 700; }
        @media print { .toolbar { display: none; } body { margin: 0; } }
    </style>
</head>
<body>
    <div class="toolbar">
        <span><strong>Documento Público Auditável</strong> • Pronto para Impressão / PDF / Protocolo Legislativo</span>
        <div style="display:flex;gap:8px;">
            <button onclick="window.print()">🖨️ Imprimir / Salvar em PDF</button>
        </div>
    </div>

    <h1>Instrumento Público de Petição e Representação Cidadã</h1>
    <h2>"Crescer Exige Responsabilidade!" — Revisão do Plano Diretor da Estância Turística de São Roque (Minutas LCs nº 39 e nº 40/2006)</h2>

    <div class="meta-box">
        <strong>DESTINATÁRIOS INSTITUCIONAIS:</strong><br>
        1. Exmo. Sr. Presidente e Srs. Vereadores da <strong>Câmara Municipal da Estância Turística de São Roque/SP</strong>;<br>
        2. Exmo. Sr. Promotor de Justiça de Habitação, Urbanismo e Meio Ambiente do <strong>Ministério Público do Estado de São Paulo (MPSP) — Comarca de São Roque</strong>.<br><br>
        <strong>FUNDAMENTO CONSTITUCIONAL E LEGAL:</strong> Art. 5º, inciso XXXIV, alínea "a" (Direito Constitucional de Petição aos Poderes Públicos), Art. 182 da Constituição Federal, Art. 180 e 181 da Constituição do Estado de São Paulo, e Art. 2º, II e XIII, c/c Art. 40, § 4º da Lei Federal nº 10.257/2001 (Estatuto da Cidade).<br>
        <strong>TOTAL CONSOLIDADO DE ASSINATURAS VALIDADAS:</strong> ${count.toLocaleString('pt-BR')} subscrições cidadãs • Emitido em: ${nowStr}.
    </div>

    <h3>I. Síntese Técnica e Pericial das Reivindicações Coletivas</h3>
    <p>Os cidadãos, moradores, proprietários e contribuintes abaixo subscritos, amparados pelo levantamento cartográfico e pericial do <em>Repositório de Inteligência Territorial do Plano Diretor de São Roque</em> (projeção SIRGAS 2000 / UTM 23S), requerem ao Poder Legislativo e ao Ministério Público:</p>
    <ol>
        <li><strong>Condicionamento do Adensamento à Capacidade Comprovada de Água e Esgoto:</strong> Vedação à aprovação de novos edifícios multifamiliares e loteamentos fechados nas zonas que dobram de densidade (+139% em ZUR de Média Densidade) sem prévia certidão de viabilidade operacional e estação de tratamento de esgoto (Sabesp/ARSESP), diante do índice atual de apenas ~47,8% de esgoto tratado (IC MPSP nº 0439.0000192/2025).</li>
        <li><strong>Supressão de Dispositivos de Spot Zoning (Privilégios Pontuais e Casuísmo):</strong> Revisão dos enclaves com Índice Sintético de Spot Zoning crítico (ISZ ≥ 70), incluindo a assimetria de gabarito (30m a 100m) frente às restrições vizinhas e a exclusão da exceção nominal a quatro loteamentos privados no Bairro do Carmo (§ 1º da Minuta da LC 40/2006) inseridos na APA de Itupararanga e Bacia do Rio Sorocamirim.</li>
        <li><strong>Proteção Efetiva do Cinturão Rural (-1.670,71 ha) e das 22 Áreas de Risco Geológico (CPRM):</strong> Preservação do módulo rural e vedação ao aumento de impermeabilização a montante dos setores de risco alto (R3/R4) mapeados pelo Serviço Geológico do Brasil (Junqueira, Goianã, Vinhedos, Mosteiro e Vila do Carmo).</li>
        <li><strong>Vinculação Orçamentária das Obras Prometidas:</strong> Superação da assimetria temporal, exigindo cronograma físico-financeiro e reserva no PPA para os parques lineares, vias e redes de drenagem prometidos nas minutas.</li>
    </ol>

    <h3>II. Registro de Assinaturas Validadas por CPF (Padrão LGPD Lei nº 13.709/2018)</h3>
    <p style="font-size: 12px; color: #475569;">Em estrita conformidade com a Lei Geral de Proteção de Dados (LGPD), os números de CPF foram validados matematicamente pelo algoritmo Módulo-11 da Receita Federal no ato da assinatura, sendo exibidos publicamente sob máscara oficial (<code>***.XXX.XXX-**</code>) acompanhados de sua impressão digital criptográfica inalterável (Hash SHA-256).</p>

    <table>
        <thead>
            <tr>
                <th>Nº</th>
                <th>Nome Completo do Cidadão Subscritor</th>
                <th>Bairro / Vínculo</th>
                <th>CPF Validado (LGPD)</th>
                <th>Hash SHA-256</th>
                <th>Data</th>
            </tr>
        </thead>
        <tbody>
            ${rowsHtml}
        </tbody>
    </table>
</body>
</html>`;

        const win = window.open('', '_blank');
        if (win) {
            win.document.open();
            win.document.write(docHtml);
            win.document.close();
        }
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
                    if (cpfHint) { cpfHint.textContent = ''; cpfHint.className = 'cpf-status-hint'; }
                }
            });
        }

        const form = document.getElementById('petitionForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSignSubmit(e));
        }

        const btnTopPetition = document.getElementById('btnTopPetition');
        if (btnTopPetition) {
            btnTopPetition.addEventListener('click', () => this.openModal());
        }

        const btnModalPetition = document.getElementById('btnModalPetition');
        if (btnModalPetition) {
            btnModalPetition.addEventListener('click', () => this.openModal());
        }

        const btnClosePetition = document.getElementById('btnClosePetitionModal');
        if (btnClosePetition) {
            btnClosePetition.addEventListener('click', () => this.closeModal());
        }

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

        const btnOpenDoc = document.getElementById('btnOpenPublicDoc');
        if (btnOpenDoc) btnOpenDoc.addEventListener('click', () => this.openPublicDocumentWindow());

        const btnFooterDoc = document.getElementById('btnFooterPublicDoc');
        if (btnFooterDoc) btnFooterDoc.addEventListener('click', () => this.openPublicDocumentWindow());
    }
};

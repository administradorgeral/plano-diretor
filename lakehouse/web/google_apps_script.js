/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT — Sincronizador Serverless da Petição Pública de São Roque
 * ==============================================================================
 * Conecta o site do GitHub Pages à sua Planilha do Google em tempo real.
 * 
 * INSTRUÇÕES RÁPIDAS (Leva 2 minutos):
 * 1. Abra o Google Drive (drive.google.com) e crie uma nova "Planilha Google"
 *    (Nomeie como: "Petição São Roque - Crescer exige responsabilidade");
 * 2. No menu superior da Planilha, clique em: Extensões > Apps Script;
 * 3. Apague tudo o que estiver lá e COLE ESTE CÓDIGO COMPLETO;
 * 4. Clique no ícone de Salvar (💾);
 * 5. Clique no botão azul "Implantar" (canto superior direito) > "Nova implantação";
 * 6. Na engrenagem ⚙️ (Selecionar tipo), escolha: "App da Web";
 * 7. Preencha:
 *    - Descrição: "API Petição São Roque"
 *    - Executar como: "Eu (seu e-mail)"
 *    - Quem tem acesso: "Qualquer pessoa" (ou "Anyone")  <-- IMPORTANTE!
 * 8. Clique em "Implantar" e copie a "URL do app da Web" gerada
 *    (Exemplo: https://script.google.com/macros/s/AKfycbx.../exec);
 * 9. Cole essa URL no arquivo `lakehouse/web/js/config.js` no campo REMOTE_WEBHOOK_URL.
 * ==============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Garante que o cabeçalho exista
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "N_Sequencial",
        "Protocolo",
        "Nome_Completo",
        "Bairro",
        "Vinculo",
        "CPF_Mascarado_LGPD",
        "Hash_SHA256",
        "Relato_Impacto",
        "Data_Hora_ISO"
      ]);
      // Formata cabeçalho
      sheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#059669").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
    
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No data" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = JSON.parse(e.postData.contents);
    if (!data.name) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Missing name" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Verifica duplicidade por Hash ou CPF mascarado
    var rows = sheet.getDataRange().getValues();
    var hashTarget = data.fullHash || data.hash || "";
    var nameCpfTarget = (data.name || "").trim().toLowerCase() + "_" + (data.cpfMasked || "");
    
    for (var i = 1; i < rows.length; i++) {
      var rowHash = String(rows[i][6] || "");
      var rowNameCpf = String(rows[i][2] || "").trim().toLowerCase() + "_" + String(rows[i][5] || "");
      if ((hashTarget && rowHash === hashTarget) || (nameCpfTarget && rowNameCpf === nameCpfTarget)) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "ok",
          duplicate: true,
          number: rows[i][0]
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    var nextNumber = Math.max(1, sheet.getLastRow()); // Primeira linha após cabeçalho é #1
    var proto = data.protocol || ("SRQ-2026-" + (hashTarget.slice(0, 8) || "OFICIAL").toUpperCase());
    var timestamp = data.timestamp || new Date().toISOString();
    
    sheet.appendRow([
      nextNumber,
      proto,
      data.name,
      data.bairro || "São Roque",
      data.vinculo || "Morador(a)",
      data.cpfMasked || "***.***.***-**",
      hashTarget,
      data.comment || "",
      timestamp
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "ok",
      number: nextNumber,
      protocol: proto
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "ok",
        count: 0,
        signatures: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var signatures = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (!r[2]) continue; // Pula se nome vazio
      
      var d = r[8];
      var timeIso = d instanceof Date ? d.toISOString() : String(d || "");
      
      signatures.push({
        number: r[0] || i,
        protocol: String(r[1] || ""),
        name: String(r[2] || ""),
        bairro: String(r[3] || "São Roque"),
        vinculo: String(r[4] || "Morador(a)"),
        cpfMasked: String(r[5] || "***.***.***-**"),
        fullHash: String(r[6] || ""),
        hash: String(r[6] || "").slice(0, 16),
        comment: String(r[7] || ""),
        timestamp: timeIso
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "ok",
      count: signatures.length,
      signatures: signatures
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      error: err.toString(),
      count: 0,
      signatures: []
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

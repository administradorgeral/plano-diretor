/**
 * ============================================================================
 * BACKEND SERVERLESS GRATUITO PARA GITHUB PAGES (Google Apps Script + Sheets)
 * Petição Pública: "Crescer exige responsabilidade!" — Plano Diretor São Roque
 * ============================================================================
 *
 * COMO ATIVAR EM 2 MINUTOS:
 * 1. Crie uma planilha no Google Sheets com as colunas na Linha 1:
 *    [Protocolo | Nome | Bairro | Vinculo | CPF_Mascarado | Hash_SHA256 | Comentario | Data_ISO]
 * 2. No menu da planilha, clique em "Extensões" > "Apps Script".
 * 3. Cole este código, clique em "Implantar" > "Nova implantação" > Tipo: "App da Web".
 * 4. Configure "Quem pode acessar": "Qualquer pessoa" e copie a URL gerada.
 * 5. Cole a URL em `lakehouse/web/js/config.js` no campo `REMOTE_WEBHOOK_URL`.
 */

const BASE_COUNT = 50;

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  let sigs = [];
  if (lastRow > 1) {
    const data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    sigs = data.map((row) => ({
      protocol: String(row[0] || ''),
      name: String(row[1] || ''),
      bairro: String(row[2] || ''),
      vinculo: String(row[3] || ''),
      cpfMasked: String(row[4] || '***.***.***-**'),
      fullHash: String(row[5] || ''),
      hash: String(row[5] || '').slice(0, 16),
      comment: String(row[6] || ''),
      timestamp: String(row[7] || '')
    }));
  }
  const payload = {
    status: 'ok',
    count: BASE_COUNT + (lastRow > 1 ? lastRow - 1 : 0),
    signatures: sigs
  };
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Verifica deduplicação pelo Hash SHA-256 na coluna F (6)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const hashes = sheet.getRange(2, 6, lastRow - 1, 1).getValues().flat();
      if (hashes.includes(data.fullHash || data.hash)) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'duplicate', count: BASE_COUNT + lastRow - 1 }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    sheet.appendRow([
      data.protocol || '',
      data.name || '',
      data.bairro || '',
      data.vinculo || '',
      data.cpfMasked || '***.***.***-**',
      data.fullHash || data.hash || '',
      data.comment || '',
      data.timestamp || new Date().toISOString()
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'recorded',
      count: BASE_COUNT + sheet.getLastRow() - 1
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

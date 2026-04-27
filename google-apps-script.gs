/**
 * Backend para BIS-11 - Google Apps Script
 *
 * INSTRUCCIONES DE CONFIGURACION:
 *
 * 1. Ve a https://sheets.google.com y crea una nueva hoja de calculo
 * 2. Ponle nombre: "BIS-11 Resultados"
 * 3. En el menu, ve a Extensiones > Apps Script
 * 4. Borra el codigo que aparece y pega TODO este archivo
 * 5. Haz clic en "Guardar" (icono de disquete)
 * 6. Haz clic en "Implementar" > "Nueva implementacion"
 * 7. En "Tipo", selecciona "Aplicacion web"
 * 8. En "Ejecutar como", selecciona "Yo"
 * 9. En "Quien tiene acceso", selecciona "Cualquier persona"
 * 10. Haz clic en "Implementar"
 * 11. Copia la URL que aparece (termina en /exec)
 * 12. Pega esa URL en la variable SCRIPT_URL de index.html y admin.html
 *
 * IMPORTANTE: Si modificas el script, debes crear una NUEVA implementacion
 * (Implementar > Nueva implementacion) para que los cambios tomen efecto.
 */

const SHEET_NAME = 'Resultados';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Fecha', 'Nombre', 'RUT', 'Total',
      'Atencional', 'Motora', 'No Planificada',
      'Nivel', 'Respuestas'
    ]);
    // Formato de encabezado
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    // Support both form submission and raw JSON
    const data = e.parameter.data ? JSON.parse(e.parameter.data) : JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    sheet.appendRow([
      data.fecha || new Date().toISOString(),
      data.nombre || '',
      data.rut || '',
      data.total || 0,
      data.atencional || 0,
      data.motora || 0,
      data.noPlanificada || 0,
      data.nivel || '',
      JSON.stringify(data.respuestas || {})
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      const result = JSON.stringify([]);
      const callback = e.parameter.callback;
      if (callback) {
        return ContentService.createTextOutput(callback + '(' + result + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(result)
        .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = ['fecha', 'nombre', 'rut', 'total', 'atencional', 'motora', 'noPlanificada', 'nivel', 'respuestas'];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] !== undefined ? row[i] : '';
      });
      // Convert date to ISO string if it's a Date object
      if (obj.fecha instanceof Date) {
        obj.fecha = obj.fecha.toISOString();
      }
      return obj;
    });

    const result = JSON.stringify(rows);
    const callback = e.parameter.callback;

    if (callback) {
      return ContentService.createTextOutput(callback + '(' + result + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService.createTextOutput(result)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    const errResult = JSON.stringify({ status: 'error', message: err.toString() });
    const callback = e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + errResult + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(errResult)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

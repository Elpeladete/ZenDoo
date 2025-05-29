// Configuración de Odoo
const db = "dye_test_0201";
const login = "maused@dyesa.com";
const password = "AusedM";
const odooUrl = "https://test-dye.quilsoft.com";

// ID de la hoja de cálculo donde se guardarán los registros
const sheetId = "12dnvRQss5aIRj5Y1LasxxG7h1wZa0SD5BScU0aZOVMY"; // Tu ID de hoja

function cleanPhoneNumber(phone) {
  return phone.replace(/\D/g, '');
}

function loginToOdoo() {
  var url = `${odooUrl}/web/session/authenticate`;
  Logger.log("🌐 Intentando iniciar sesión en: %s", url);

  var payload = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "db": db,
      "login": login,
      "password": password
    }
  };

  var options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json"
    },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    var content = response.getContentText();
    var cookies = response.getAllHeaders()['Set-Cookie'];

    Logger.log("✅ Código de respuesta HTTP: %d", code);

    if (code === 200 && content.includes('"result":')) {
      var result = JSON.parse(content).result;

      Logger.log("🍪 Sesión iniciada, cookies recibidas");
      Logger.log("👤 UID del usuario: %s", result.uid);
      Logger.log("🏢 Base de datos: %s", result.db);
      Logger.log("🧑‍💼 Partner ID del usuario: %s", result.partner_id);
      Logger.log("🏠 Empresa actual: %s", result.user_companies.current_company);

      return {
        cookies: cookies,
        uid: result.uid,
        partner_id: result.partner_id,
        db: result.db,
        current_company: result.user_companies.current_company
      };
    } else {
      Logger.log("❌ Error en la respuesta de Odoo");
      return {
        cookies: null,
        error: "Error en login: " + content
      };
    }

  } catch (e) {
    Logger.log("🚫 Excepción al conectar con Odoo: %s", e.toString());
    Logger.log("STACK TRACE: %s", e.stack);
    return {
      cookies: null,
      error: "Excepción: " + e.toString()
    };
  }
}

function testEnviarMensajeOdoo() {
  try {
    // Datos simulados del webhook
    var from = "+5493476626662"; // Número del cliente
    var messageText = "Hola!!";
    var timestamp = new Date().toISOString();

    Logger.log("📞 Simulando mensaje desde: %s", from);
    Logger.log("💬 Contenido del mensaje: %s", messageText);

    // Iniciar sesión en Odoo
    var session = loginToOdoo();

    if (!session.cookies || session.cookies.length === 0) {
      Logger.log("❌ No se recibieron cookies después del login");
      return;
    }

    Logger.log("✅ Sesión iniciada como usuario UID: %s", session.uid);
    Logger.log("🧑‍💼 Partner ID del usuario: %s", session.partner_id);

    // Limpiar número y buscar contacto
    from = cleanPhoneNumber(from);
    var partnerId = findPartnerInOdoo(from, session.cookies);

    if (!partnerId) {
      Logger.log("❌ No se encontró ningún contacto con ese número");
      logToGoogleSheets(from, messageText, false, timestamp, "No encontrado");
      return;
    }

    Logger.log("✅ Contacto encontrado con ID: %d", partnerId);

    // Registrar actividad en Odoo
    var result = createActivityInOdoo(partnerId, messageText, from, timestamp, session.cookies);

    if (result) {
      Logger.log("✅ Actividad registrada exitosamente en Odoo");
      logToGoogleSheets(from, messageText, true, timestamp, "Registrado en Odoo");
    } else {
      Logger.log("❌ Error al registrar la actividad en Odoo");
      logToGoogleSheets(from, messageText, false, timestamp, "Fallo en registro");
    }

  } catch (e) {
    Logger.log("🚫 Error durante la prueba: %s", e.toString());
    Logger.log("STACK TRACE: %s", e.stack);
    logToGoogleSheets(from, messageText, false, timestamp, "Error: " + e.toString());
  }
}

function findPartnerInOdoo(phoneNumber, cookies) {
  var url = `${odooUrl}/web/dataset/call_kw/res.partner/search_read`;

  var payload = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "model": "res.partner",
      "method": "search_read",
      "args": [],
      "kwargs": {
        "domain": [["phone", "=", phoneNumber]],
        "fields": ["id", "name"]
      }
    }
  };

  var options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Cookie": cookies ? cookies.join("; ") : ""
    },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  var response = UrlFetchApp.fetch(url, options);
  var result = JSON.parse(response.getContentText());

  if (result.result && result.result.length > 0) {
    return result.result[0].id;
  }

  return null;
}

function createActivityInOdoo(partnerId, message, from, timestamp, cookies) {
  var url = `${odooUrl}/web/dataset/call_kw/mail.activity/create`;

  var payload = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "model": "mail.activity",
      "method": "create",
      "args": [{
        "activity_type_id": 4, // Tipo de actividad (ej: Email)
        "res_id": partnerId,
        "res_model": "res.partner",
        "note": `<p>${message}</p>`,
        "summary": `Mensaje de WhatsApp de ${from}`,
        "date_deadline": timestamp.split("T")[0],
        "user_id": 1 // ID del usuario responsable
      }]
    }
  };

  var options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Cookie": cookies ? cookies.join("; ") : ""
    },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    return response.getResponseCode() === 200;
  } catch (e) {
    Logger.log("🚫 Error al crear actividad en Odoo: %s", e.toString());
    return false;
  }
}

function logToGoogleSheets(phone, message, registered, timestamp, reason = "") {
  try {
    var sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();

    var date = new Date();
    var formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    sheet.appendRow([
      formattedDate,
      phone,
      message,
      registered ? "Sí" : "No",
      reason
    ]);

    Logger.log("📁 Registro guardado en hoja de cálculo");
  } catch (e) {
    Logger.log("🚫 Error al guardar en Google Sheets: %s", e.toString());
  }
}

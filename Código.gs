// Configuración de Odoo
const ODOO_CONFIG = {
  db: "dye_test_0201",
  login: "maused@dyesa.com",
  password: "AusedM",
  url: "https://test-dye.quilsoft.com"
};

// Token de seguridad para el webhook
const WEBHOOK_TOKEN = "ZenviaOdooWebhook_Seguro2025";

// ID de la hoja de registro
const SHEET_ID = "12dnvRQss5aIRj5Y1LasxxG7h1wZa0SD5BScU0aZOVMY";

// Función principal para manejar solicitudes POST
function doPost(e) {
  const timestamp = new Date();
  let response;
  let logData = {
    timestamp: timestamp,
    rawData: "",
    prospectName: "",
    phones: "",
    agentName: "",
    messageContent: "",
    messageType: "",
    sender: "",
    recipient: "",
    status: "error",
    partnerId: "",
    response: ""
  };
  
  try {
    // Validar token
    const token = e.parameter.token;
    if (token !== WEBHOOK_TOKEN) {
      throw new Error("Token inválido");
    }

    // Procesar payload
    const rawData = e.postData.contents;
    logData.rawData = rawData;
    
    const data = JSON.parse(rawData);
    const result = processZenviaWebhook(data);
    
    // Construir datos para el log con toda la información
    const prospect = data.prospect || {};
    const interaction = data.interaction || {};
    const agent = prospect.agent || {};
    
    logData = {
      ...logData,
      prospectName: prospect.firstName || "",
      phones: (prospect.phones || []).join(", "),
      agentName: `${agent.firstName || ""} ${agent.lastName || ""}`.trim() || "Sin asesor",
      messageContent: result.messageContent || "",
      messageType: result.messageType || "",
      sender: result.sender || "",
      recipient: result.recipient || "",
      status: "success",
      partnerId: result.partnerId || "",
      response: JSON.stringify(result.response || {})
    };
    
    response = ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Mensaje procesado correctamente",
      messageType: result.messageType,
      isIncoming: result.isIncoming,
      partnerId: result.partnerId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    logData = {
      ...logData,
      response: err.message
    };
    
    response = ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    // Registrar en hoja de cálculo
    logToSheet(logData);
  }
  
  return response;
}

// Función para manejar solicitudes GET (verificación)
function doGet(e) {
  try {
    // Validar token
    const token = e.parameter.token;
    if (token !== WEBHOOK_TOKEN) {
      throw new Error("Token inválido");
    }
    
    return ContentService.createTextOutput("Webhook activo y funcionando");
    
  } catch (err) {
    return ContentService.createTextOutput(`Error: ${err.message}`);
  }
}

function processZenviaWebhook(data) {
  // Extraer datos clave
  const prospect = data.prospect || {};
  const interaction = data.interaction || {};
  const agent = prospect.agent || {};
  
  // Obtener contenido del mensaje
  const message = interaction.output?.message || {};
  const messageContent = message.content || message.body || "";
  
  // Identificar tipo de mensaje y participantes
  const isIncoming = interaction.proactive === false;
  const messageType = isIncoming ? "📥 ENTRANTE" : "📤 SALIENTE";
  const sender = message.sender || "";
  const recipient = message.recipient || "";
  
  // Información del asesor
  const agentName = `${agent.firstName || ""} ${agent.lastName || ""}`.trim();
  const agentInfo = agentName || "Asesor no identificado";
  
  console.log(`\n🔍 === PROCESANDO MENSAJE ${messageType} ===`);
  console.log(`👤 Cliente: ${prospect.firstName || "Sin nombre"}`);
  console.log(`🏢 Asesor: ${agentInfo}`);
  console.log(`📞 De: ${sender}`);
  console.log(`📞 Para: ${recipient}`);
  console.log(`💬 Contenido: ${messageContent}`);
  console.log(`🔄 Proactive: ${interaction.proactive}`);
  
  // Normalizar teléfonos
  const phones = (prospect.phones || []).map(normalizePhone);
  const firstName = prospect.firstName || "";
    // Buscar o crear partner en Odoo para TODOS los mensajes
  let partnerId = null;
  let postResult = null;
  
  if (messageContent) {
    console.log(`\n📝 Procesando mensaje ${messageType} en Odoo...`);
    try {
      partnerId = findOrCreatePartner(phones, firstName);
      console.log(`✅ Partner encontrado/creado: ${partnerId}`);
        // Crear mensaje con formato similar a WhatsApp
      const timestamp = getBuenosAiresTimestamp();
      const isIncoming = messageType === "📥 ENTRANTE";
      
      const fullMessage = createWhatsAppMessage({
        messageType,
        isIncoming,
        firstName,
        agentInfo,
        phone: phones[0] || sender,
        sender,
        recipient,
        timestamp,
        messageContent
      });
      
      postResult = postMessageToPartner(partnerId, fullMessage);
      console.log(`✅ Mensaje ${messageType} creado en Odoo chatter`);
    } catch (error) {
      console.log(`❌ Error procesando ${messageType} en Odoo: ${error.message}`);
      postResult = {error: error.message};
    }
  } else {
    console.log(`ℹ️ Mensaje ${messageType} sin contenido - solo se registra en Google Sheets`);
    postResult = {skipped: `Mensaje ${messageType} sin contenido`};
  }
  
  return {
    partnerId: partnerId,
    messageContent: messageContent,
    messageType: messageType,
    agentName: agentInfo,
    isIncoming: isIncoming,
    sender: sender,
    recipient: recipient,
    response: postResult
  };
}

function normalizePhone(phone) {
  if (!phone) return "";
  // Conservar el '+' inicial y remover otros caracteres no numéricos
  const normalized = phone.startsWith('+') ? 
    '+' + phone.substring(1).replace(/\D/g, '') : 
    phone.replace(/\D/g, '');
  
  // Para números argentinos: convertir 9 a +549
  if (normalized.length === 10 && normalized.startsWith('9')) {
    return '+54' + normalized;
  }
  return normalized;
}

function findOrCreatePartner(phones, name) {
  // Buscar por teléfonos normalizados
  for (const phone of phones) {
    if (!phone) continue;
    
    const domain = ['|', 
      ['phone', 'ilike', phone], 
      ['mobile', 'ilike', phone]
    ];
    
    const partnerIds = odooSearch('res.partner', domain, 1);
    if (partnerIds.length > 0) return partnerIds[0];
  }
  
  // Buscar por nombre si no se encontró por teléfono
  if (name) {
    const domain = [['name', 'ilike', name]];
    const partnerIds = odooSearch('res.partner', domain, 1);
    if (partnerIds.length > 0) return partnerIds[0];
  }
  
  // Crear nuevo contacto
  return odooCreate('res.partner', {
    name: name || phones[0] || "Contacto Zenvia",
    mobile: phones[0] || ""
  });
}

function postMessageToPartner(partnerId, message) {
  if (!message || !partnerId) return null;
  
  try {
    const result = odooCall('res.partner', 'message_post', [
      parseInt(partnerId)
    ], {
      body: message,
      message_type: 'comment',
      subtype_xmlid: 'mail.mt_comment'
    });
    
    return result;
  } catch (e) {
    return {error: e.message};
  }
}

function logToSheet(logData) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    
    // Si es la primera ejecución, crear encabezados mejorados
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "Tipo Mensaje", "Cliente", "Teléfonos", 
        "Asesor", "De", "Para", "Contenido Mensaje", 
        "Status", "Partner ID", "Respuesta Odoo", "Raw Data"
      ]);
    }
    
    const row = [
      logData.timestamp,
      logData.messageType || "No identificado",
      logData.prospectName,
      logData.partnerId,
      logData.phones,
      logData.agentName,
      logData.sender || "",
      logData.recipient || "",
      logData.messageContent,
      logData.status,
      logData.response,
      logData.rawData.substring(0, 500) + "..." // Limitar raw data
    ];
    
    sheet.appendRow(row);
    console.log(`📊 Registrado en Google Sheets: ${logData.messageType} de ${logData.prospectName}`);
  } catch (e) {
    console.error("Error al registrar en hoja:", e);
  }
}

// ========== Funciones de conexión Odoo ========== //
let _uid = null;

function getOdooUid() {
  if (_uid) return _uid;
  
  const response = odooRpc("common", "authenticate", [
    ODOO_CONFIG.db,
    ODOO_CONFIG.login,
    ODOO_CONFIG.password,
    {}
  ]);
  
  if (response && response.result) {
    _uid = response.result;
    return _uid;
  }
  
  throw new Error("Error de autenticación en Odoo: " + 
    (response.error ? JSON.stringify(response.error) : "Respuesta vacía"));
}

function odooRpc(service, method, args) {
  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service,
      method,
      args
    },
    id: Math.floor(Math.random() * 1000000)
  };
  
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  };
  
  const url = `${ODOO_CONFIG.url}/jsonrpc`;
  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}

function odooCall(model, method, args = [], kwargs = {}) {
  try {
    const uid = getOdooUid();
    console.log(`🔧 Odoo Call: ${model}.${method} con UID: ${uid}`);
    
    const response = odooRpc("object", "execute_kw", [
      ODOO_CONFIG.db,
      uid,
      ODOO_CONFIG.password,
      model,
      method,
      args,
      kwargs
    ]);
    
    if (response.error) {
      console.error(`❌ Error en Odoo Call: ${JSON.stringify(response.error)}`);
      throw new Error(`Odoo Error: ${response.error.message || JSON.stringify(response.error)}`);
    }
    
    console.log(`✅ Odoo Call exitoso: ${model}.${method}`);
    return response;
  } catch (e) {
    console.error(`🚫 Exception en odooCall: ${e.message}`);
    throw e;
  }
}

function odooSearch(model, domain, limit = 1) {
  const response = odooCall(model, "search", [domain], {limit: limit});
  return response.result || [];
}

function odooCreate(model, data) {
  const response = odooCall(model, "create", [data]);
  return response.result;
}

// ========== FUNCIONES DE PRUEBA ========== //

// Función de prueba para verificar que el webhook funciona con GET y POST
function testWebhookFunctions() {
  try {
    Logger.log("🧪 === PROBANDO FUNCIONES DEL WEBHOOK CORREGIDAS ===");
    
    // Mostrar información del webhook
    Logger.log("\n📋 === INFORMACIÓN DEL WEBHOOK ===");
    Logger.log("URL: https://script.google.com/macros/s/<TU_ID>/exec");
    Logger.log("Token: " + WEBHOOK_TOKEN);
    
    // Simular petición GET sin token (verificación)
    Logger.log("\n📞 === PROBANDO doGet SIN TOKEN ===");
    var getEvent1 = { parameter: {} };
    var getResponse1 = doGet(getEvent1);
    Logger.log("✅ Respuesta GET sin token: %s", getResponse1.getContent());
    
    // Simular petición GET con token válido
    Logger.log("\n📞 === PROBANDO doGet CON TOKEN VÁLIDO ===");
    var getEvent2 = { parameter: { token: WEBHOOK_TOKEN } };
    var getResponse2 = doGet(getEvent2);
    Logger.log("✅ Respuesta GET con token: %s", getResponse2.getContent());
    
    // Simular petición GET con token inválido
    Logger.log("\n📞 === PROBANDO doGet CON TOKEN INVÁLIDO ===");
    var getEvent3 = { parameter: { token: "token_incorrecto" } };
    var getResponse3 = doGet(getEvent3);
    Logger.log("⚠️ Respuesta GET token inválido: %s", getResponse3.getContent());
    
    // Simular petición POST con datos de Zenvia
    Logger.log("\n📨 === PROBANDO doPost CON MENSAJE DE ZENVIA ===");
    var postData = {
      subscriptionId: "test_subscription_id",
      prospect: {
        id: "test_prospect_id",
        firstName: "Martín Aused",
        phones: ["+5493476626662"],
        agent: {
          firstName: "Cristian",
          lastName: "Zanello"
        }
      },
      interaction: {
        output: {
          message: {
            content: "Mensaje de prueba completo desde testWebhookFunctions"
          }
        }
      }
    };
    
    var postEvent = {
      parameter: { token: WEBHOOK_TOKEN },
      postData: { 
        contents: JSON.stringify(postData),
        type: "application/json"
      }
    };
    
    var postResponse = doPost(postEvent);
    Logger.log("✅ Respuesta POST: %s", postResponse.getContent());
    
    Logger.log("\n🏁 === PRUEBAS DEL WEBHOOK COMPLETADAS ===");
    Logger.log("✅ Ahora tanto doGet como doPost deberían funcionar correctamente");
    Logger.log("📊 Revisa Google Sheets para verificar que el mensaje se registró");
    
  } catch (e) {
    Logger.log("🚫 Error en prueba de webhook: %s", e.toString());
    Logger.log("STACK TRACE: %s", e.stack);
  }
}

// Función para obtener la hora de Buenos Aires
function getBuenosAiresTimestamp() {
  const now = new Date();
  // Buenos Aires está en UTC-3, sin horario de verano
  const offset = -3 * 60; // 3 horas en minutos
  const buenosAiresTime = new Date(now.getTime() + offset * 60000);
  return buenosAiresTime.toISOString();
}

// Función para crear mensajes con formato simple y claro
function createWhatsAppMessage(data) {
  const {
    messageType,
    isIncoming,
    firstName,
    agentInfo,
    phone,
    sender,
    recipient,
    timestamp,
    messageContent
  } = data;

  // Formatear la hora para que sea más legible
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const timeFormatted = formatTime(timestamp);
  
  if (isIncoming) {
    // MENSAJE ENTRANTE - Cliente escribió
    return `🟢 📥 - ${firstName || 'Cliente'} 👤 (${phone || sender}) escribió:
  - ${messageContent}
  🕐 ${timeFormatted}`;
  } else {
    // MENSAJE SALIENTE - Empresa/Asesor respondió
    const responder = agentInfo !== 'Asesor no identificado' ? `${agentInfo} 👨‍💼` : 'Zenvia Bot 🤖';
    return `🔵 📤 - ${responder} respondió:
  - ${messageContent}
  🕐 ${timeFormatted}`;
  }
}

// Función para probar con los datos reales capturados de Valen
function testConDatosRealesValen() {
  try {
    Logger.log("🧪 === PROBANDO CON DATOS REALES DE VALEN MALACALZA ===");
    
    // Datos exactos capturados del webhook
    const datosReales = {
      "subscriptionId": "6839b85e6102e065231acde9",
      "topic": "interactions",
      "type": "created",
      "prospect": {
        "id": "6839adab174691bbcbe59249",
        "firstName": "Valen Malacalza",
        "phones": ["+5492477502724"],
        "agent": {
          "id": "65bbbadd2639023b9027c86f",
          "firstName": "Cristian",
          "lastName": "Zanello"
        }
      },
      "interaction": {
        "id": "6839bd2085e73bb00ebd1419",
        "proactive": false,  // ✅ Mensaje entrante
        "output": {
          "message": {
            "via": "whatsApp",
            "body": "Ok me avisas cuando este y te aviso si agarra",
            "content": "Ok me avisas cuando este y te aviso si agarra",
            "sender": "+5492477502724",
            "recipient": "5493472545345"
          }
        }
      }
    };
    
    Logger.log("📋 === DATOS A PROCESAR ===");
    Logger.log("👤 Cliente: %s", datosReales.prospect.firstName);
    Logger.log("📞 Teléfono: %s", datosReales.prospect.phones[0]);
    Logger.log("🏢 Asesor: %s %s", datosReales.prospect.agent.firstName, datosReales.prospect.agent.lastName);
    Logger.log("💬 Mensaje: %s", datosReales.interaction.output.message.content);
    Logger.log("🔄 Proactive: %s (entrante: %s)", datosReales.interaction.proactive, !datosReales.interaction.proactive);
    Logger.log("📤 De: %s", datosReales.interaction.output.message.sender);
    Logger.log("📥 Para: %s", datosReales.interaction.output.message.recipient);
    
    // Simular evento completo del webhook
    const mockEvent = {
      parameter: { token: WEBHOOK_TOKEN },
      postData: { 
        contents: JSON.stringify(datosReales),
        type: "application/json"
      }
    };
    
    Logger.log("\n🔄 === EJECUTANDO WEBHOOK COMPLETO ===");
    const resultado = doPost(mockEvent);
    const resultContent = resultado.getContent();
    
    Logger.log("\n✅ === RESULTADO DEL PROCESAMIENTO ===");
    Logger.log("📊 Respuesta: %s", resultContent);
    
    const resultObj = JSON.parse(resultContent);
    if (resultObj.status === "success") {
      Logger.log("🎉 ¡PROCESAMIENTO EXITOSO!");
      Logger.log("   Tipo de mensaje: %s", resultObj.messageType);
      Logger.log("   Es entrante: %s", resultObj.isIncoming);
      Logger.log("   Partner ID: %s", resultObj.partnerId);
    } else {
      Logger.log("❌ Error en procesamiento: %s", resultObj.message);
    }
    
    Logger.log("\n📊 Revisa Google Sheets para ver el registro completo");
    Logger.log("🏁 === PRUEBA COMPLETADA ===");
    
  } catch (e) {
    Logger.log("🚫 Error en prueba: %s", e.toString());
    Logger.log("📋 Stack: %s", e.stack);
  }
}

// Función para probar un mensaje saliente (para verificar que se registra pero no se envía a Odoo)
function testMensajeSaliente() {
  try {
    Logger.log("🧪 === PROBANDO MENSAJE SALIENTE ===");
    
    const mensajeSaliente = {
      "subscriptionId": "test-saliente",
      "topic": "interactions",
      "type": "created", 
      "prospect": {
        "firstName": "Cliente Test",
        "phones": ["+5493476626662"],
        "agent": {
          "firstName": "Cristian",
          "lastName": "Zanello"
        }
      },
      "interaction": {
        "proactive": true,  // ✅ Mensaje saliente
        "output": {
          "message": {
            "via": "whatsApp",
            "body": "Hola, te escribo desde la empresa para consultarte algo",
            "content": "Hola, te escribo desde la empresa para consultarte algo",
            "sender": "5493472545345",
            "recipient": "+5493476626662"
          }
        }
      }
    };
    
    Logger.log("📋 Procesando mensaje SALIENTE...");
    Logger.log("🔄 Proactive: %s", mensajeSaliente.interaction.proactive);
    
    const mockEvent = {
      parameter: { token: WEBHOOK_TOKEN },
      postData: { 
        contents: JSON.stringify(mensajeSaliente),
        type: "application/json"
      }
    };
    
    const resultado = doPost(mockEvent);
    const resultContent = resultado.getContent();
      Logger.log("✅ Resultado: %s", resultContent);
    Logger.log("📊 Debe aparecer en Google Sheets Y crear mensaje en Odoo (ya no se filtran mensajes salientes)");
    
  } catch (e) {
    Logger.log("🚫 Error: %s", e.toString());
  }
}
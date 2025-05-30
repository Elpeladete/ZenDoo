/**
 * DIAGNÓSTICO Y CORRECCIÓN URGENTE - MENSAJE REAL CAPTURADO
 * 
 * Datos del mensaje entrante real:
 * - Cliente: Valen Malacalza
 * - Teléfono: +5492477502724  
 * - Mensaje: "Ok me avisas cuando este y te aviso si agarra"
 * - Proactive: false (ENTRANTE - debe procesarse)
 */

/**
 * Función para probar con los datos reales capturados
 */
function procesarMensajeRealCapturado() {
  Logger.log("🚨 === PROCESANDO MENSAJE REAL CAPTURADO ===");
  
  // Datos reales del webhook capturado
  var datosReales = {
    "subscriptionId": "6839b85e6102e065231acde9",
    "topic": "interactions",
    "type": "created",
    "prospect": {
      "firstName": "Valen Malacalza",
      "phones": ["+5492477502724"]
    },
    "interaction": {
      "proactive": false,  // ← MENSAJE ENTRANTE
      "output": {
        "message": {
          "via": "whatsApp",
          "body": "Ok me avisas cuando este y te aviso si agarra",
          "sender": "+5492477502724",    // Cliente
          "recipient": "5493472545345"   // Agente
        }
      }
    }
  };
  
  try {
    // 1. Verificar si debe procesarse
    Logger.log("🔍 PASO 1: Verificando si debe procesarse...");
    var shouldProcess = shouldProcessZenviaWebhook(datosReales);
    Logger.log("¿Debe procesarse? %s", shouldProcess);
    
    if (!shouldProcess) {
      Logger.log("❌ ERROR: El mensaje no pasó los filtros");
      return false;
    }
    
    // 2. Extraer datos del mensaje
    Logger.log("\n🔍 PASO 2: Extrayendo datos del mensaje...");
    var messageData = extractZenviaMessageDataCorrected(datosReales);
    Logger.log("Datos extraídos: %s", JSON.stringify(messageData, null, 2));
    
    if (!messageData) {
      Logger.log("❌ ERROR: No se pudieron extraer datos");
      return false;
    }
    
    // 3. Verificar autenticación
    Logger.log("\n🔍 PASO 3: Verificando autenticación...");
    var uid = getUidXMLRPCSimplified();
    if (!uid) {
      Logger.log("❌ ERROR: Sin autenticación Odoo");
      return false;
    }
    Logger.log("✅ UID obtenido: %s", uid);
    
    // 4. Buscar contacto en Odoo
    Logger.log("\n🔍 PASO 4: Buscando contacto en Odoo...");
    var partnerId = findPartnerSimplified("+5492477502724", uid);
    Logger.log("Partner ID encontrado: %s", partnerId);
    
    if (!partnerId) {
      Logger.log("❌ ERROR: Contacto no encontrado en Odoo");
      Logger.log("📋 Teléfono buscado: +5492477502724");
      Logger.log("💡 SOLUCIÓN: Crear contacto con este teléfono en Odoo");
      return false;
    }
    
    // 5. Crear mensaje en Odoo
    Logger.log("\n🔍 PASO 5: Creando mensaje en Odoo...");
    var success = createMessageInOdooSimplified(
      partnerId,
      messageData.text,
      messageData.from,
      messageData.timestamp,
      uid
    );
    
    if (success) {
      Logger.log("✅ ¡MENSAJE CREADO EXITOSAMENTE EN ODOO!");
      
      // 6. Registrar en Google Sheets
      logToGoogleSheets(
        messageData.from,
        messageData.text,
        true,
        messageData.timestamp,
        "Mensaje procesado exitosamente"
      );
      
      Logger.log("🎉 === PROCESAMIENTO COMPLETO EXITOSO ===");
      return true;
    } else {
      Logger.log("❌ ERROR: Fallo al crear mensaje en Odoo");
      return false;
    }
    
  } catch (error) {
    Logger.log("🚫 ERROR en procesamiento: %s", error.toString());
    Logger.log("Stack trace: %s", error.stack);
    return false;
  }
}

/**
 * Función para verificar si el contacto existe en Odoo
 */
function verificarContactoValen() {
  Logger.log("🔍 === VERIFICANDO CONTACTO VALEN MALACALZA ===");
  
  try {
    var uid = getUidXMLRPCSimplified();
    if (!uid) {
      Logger.log("❌ Sin autenticación");
      return false;
    }
    
    var phone = "+5492477502724";
    Logger.log("📞 Buscando teléfono: %s", phone);
    
    var partnerId = findPartnerSimplified(phone, uid);
    
    if (partnerId) {
      Logger.log("✅ ¡CONTACTO ENCONTRADO!");
      Logger.log("   Partner ID: %s", partnerId);
      Logger.log("   Teléfono: %s", phone);
      Logger.log("   Nombre: Valen Malacalza");
      return partnerId;
    } else {
      Logger.log("❌ CONTACTO NO ENCONTRADO");
      Logger.log("💡 NECESITAS:");
      Logger.log("   1. Ir a Odoo");
      Logger.log("   2. Crear contacto 'Valen Malacalza'");
      Logger.log("   3. Agregar teléfono: %s", phone);
      Logger.log("   4. Volver a ejecutar esta función");
      return false;
    }
    
  } catch (error) {
    Logger.log("🚫 Error: %s", error.toString());
    return false;
  }
}

/**
 * Función para crear el contacto faltante en Odoo
 */
function crearContactoValen() {
  Logger.log("👤 === CREANDO CONTACTO VALEN MALACALZA ===");
  
  try {
    var uid = getUidXMLRPCSimplified();
    if (!uid) {
      Logger.log("❌ Sin autenticación");
      return false;
    }
    
    var url = `${odooUrl}/xmlrpc/2/object`;
    var payload = `<?xml version="1.0"?>
<methodCall>
  <methodName>execute_kw</methodName>
  <params>
    <param><value><string>${db}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${password}</string></value></param>
    <param><value><string>res.partner</string></value></param>
    <param><value><string>create</string></value></param>
    <param>
      <value>
        <array>
          <data>
            <value>
              <struct>
                <member>
                  <name>name</name>
                  <value><string>Valen Malacalza</string></value>
                </member>
                <member>
                  <name>phone</name>
                  <value><string>+5492477502724</string></value>
                </member>
                <member>
                  <name>mobile</name>
                  <value><string>+5492477502724</string></value>
                </member>
                <member>
                  <name>is_company</name>
                  <value><boolean>0</boolean></value>
                </member>
              </struct>
            </value>
          </data>
        </array>
      </value>
    </param>
  </params>
</methodCall>`;
    
    var options = {
      method: 'post',
      headers: { 'Content-Type': 'text/xml' },
      payload: payload,
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(url, options);
    var content = response.getContentText();
    
    Logger.log("📡 Respuesta creación: %s", content);
    
    if (content.includes('<int>') && !content.includes('fault')) {
      var idMatch = content.match(/<int>(\d+)<\/int>/);
      if (idMatch) {
        var partnerId = idMatch[1];
        Logger.log("✅ ¡CONTACTO CREADO EXITOSAMENTE!");
        Logger.log("   Partner ID: %s", partnerId);
        Logger.log("   Nombre: Valen Malacalza");
        Logger.log("   Teléfono: +5492477502724");
        return partnerId;
      }
    }
    
    Logger.log("❌ Error creando contacto");
    return false;
    
  } catch (error) {
    Logger.log("🚫 Error: %s", error.toString());
    return false;
  }
}

/**
 * Función de resolución completa
 */
function resolverProblemaCompleto() {
  Logger.log("🔧 === RESOLVIENDO PROBLEMA COMPLETO ===");
  
  // 1. Verificar si existe el contacto
  Logger.log("PASO 1: Verificando contacto...");
  var partnerId = verificarContactoValen();
  
  if (!partnerId) {
    Logger.log("PASO 2: Creando contacto...");
    partnerId = crearContactoValen();
    
    if (!partnerId) {
      Logger.log("❌ No se pudo crear el contacto");
      return false;
    }
  }
  
  // 2. Procesar el mensaje real
  Logger.log("PASO 3: Procesando mensaje real...");
  var success = procesarMensajeRealCapturado();
  
  if (success) {
    Logger.log("🎉 === PROBLEMA RESUELTO ===");
    Logger.log("✅ Contacto verificado/creado");
    Logger.log("✅ Mensaje procesado en Odoo");
    Logger.log("✅ Registro en Google Sheets");
    Logger.log("\n🔄 PRÓXIMO PASO:");
    Logger.log("   Cambiar doPost del modo debug al modo normal");
    return true;
  } else {
    Logger.log("❌ Problema persiste - revisar logs");
    return false;
  }
}

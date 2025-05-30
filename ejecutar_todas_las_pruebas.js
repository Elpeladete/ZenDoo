// 🚀 SCRIPT COMPLETO PARA EJECUTAR TODAS LAS PRUEBAS DEL SISTEMA ZENDOO
// Copia y pega este código completo en Google Apps Script y ejecuta la función principal

function ejecutarTodasLasPruebas() {
  Logger.log("🚀 === INICIANDO BATERÍA COMPLETA DE PRUEBAS ZENDOO ===");
  Logger.log("📅 Fecha: " + new Date().toISOString());
  
  let testsPasados = 0;
  let testsFallados = 0;
  let errores = [];
  
  // === TEST 1: Diagnóstico del sistema ===
  Logger.log("\n🔍 === TEST 1: DIAGNÓSTICO DEL SISTEMA ===");
  try {
    verificarConfiguracionBasica();
    testsPasados++;
    Logger.log("✅ Test 1 PASADO: Configuración básica correcta");
  } catch (e) {
    testsFallados++;
    errores.push("Test 1 - Configuración: " + e.message);
    Logger.log("❌ Test 1 FALLADO: " + e.message);
  }
  
  // === TEST 2: Autenticación Odoo ===
  Logger.log("\n🔐 === TEST 2: AUTENTICACIÓN ODOO ===");
  try {
    const uid = getOdooUid();
    Logger.log("✅ Test 2 PASADO: Autenticación exitosa, UID: " + uid);
    testsPasados++;
  } catch (e) {
    testsFallados++;
    errores.push("Test 2 - Autenticación: " + e.message);
    Logger.log("❌ Test 2 FALLADO: " + e.message);
    Logger.log("⚠️ Sin autenticación, tests de Odoo serán omitidos");
    return mostrarResumenFinal(testsPasados, testsFallados, errores);
  }
  
  // === TEST 3: Búsqueda en Odoo ===
  Logger.log("\n👥 === TEST 3: BÚSQUEDA EN ODOO ===");
  try {
    const partners = odooSearch('res.partner', [['name', '!=', '']], 3);
    Logger.log("✅ Test 3 PASADO: Búsqueda exitosa, encontrados: " + partners.length);
    testsPasados++;
  } catch (e) {
    testsFallados++;
    errores.push("Test 3 - Búsqueda: " + e.message);
    Logger.log("❌ Test 3 FALLADO: " + e.message);
  }
  
  // === TEST 4: Google Sheets ===
  Logger.log("\n📊 === TEST 4: ACCESO A GOOGLE SHEETS ===");
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    const filas = sheet.getLastRow();
    Logger.log("✅ Test 4 PASADO: Sheets accesible, filas: " + filas);
    testsPasados++;
  } catch (e) {
    testsFallados++;
    errores.push("Test 4 - Sheets: " + e.message);
    Logger.log("❌ Test 4 FALLADO: " + e.message);
  }
  
  // === TEST 5: Webhook GET ===
  Logger.log("\n📞 === TEST 5: WEBHOOK GET ===");
  try {
    const getEvent = { parameter: { token: WEBHOOK_TOKEN } };
    const response = doGet(getEvent);
    const content = response.getContent();
    if (content.includes("Webhook activo")) {
      Logger.log("✅ Test 5 PASADO: Webhook GET funcional");
      testsPasados++;
    } else {
      throw new Error("Respuesta inesperada: " + content);
    }
  } catch (e) {
    testsFallados++;
    errores.push("Test 5 - Webhook GET: " + e.message);
    Logger.log("❌ Test 5 FALLADO: " + e.message);
  }
    // === TEST 6: Mensaje saliente (ahora debe procesarse también) ===
  Logger.log("\n📤 === TEST 6: MENSAJE SALIENTE (AHORA SE PROCESA) ===");
  try {
    const mensajeSaliente = crearDatosPruebaSaliente();
    const postEvent = {
      parameter: { token: WEBHOOK_TOKEN },
      postData: { contents: JSON.stringify(mensajeSaliente) }
    };
    
    const response = doPost(postEvent);
    const responseData = JSON.parse(response.getContent());
    
    if (responseData.status === "success" && 
        responseData.messageType === "📤 SALIENTE" && 
        responseData.partnerId) {
      Logger.log("✅ Test 6 PASADO: Mensaje saliente procesado correctamente con Partner ID: " + responseData.partnerId);
      testsPasados++;
    } else {
      throw new Error("Mensaje saliente no fue procesado correctamente: " + JSON.stringify(responseData));
    }
  } catch (e) {
    testsFallados++;
    errores.push("Test 6 - Mensaje saliente: " + e.message);
    Logger.log("❌ Test 6 FALLADO: " + e.message);
  }
  
  // === TEST 7: Mensaje entrante (debe procesarse) ===
  Logger.log("\n📥 === TEST 7: MENSAJE ENTRANTE (PROCESAMIENTO COMPLETO) ===");
  try {
    const mensajeEntrante = crearDatosPruebaEntrante();
    const postEvent = {
      parameter: { token: WEBHOOK_TOKEN },
      postData: { contents: JSON.stringify(mensajeEntrante) }
    };
    
    const response = doPost(postEvent);
    const responseData = JSON.parse(response.getContent());
    
    if (responseData.status === "success" && 
        responseData.messageType === "📥 ENTRANTE" && 
        responseData.partnerId) {
      Logger.log("✅ Test 7 PASADO: Mensaje entrante procesado, Partner ID: " + responseData.partnerId);
      testsPasados++;
    } else {
      throw new Error("Mensaje entrante no fue procesado correctamente: " + JSON.stringify(responseData));
    }
  } catch (e) {
    testsFallados++;
    errores.push("Test 7 - Mensaje entrante: " + e.message);
    Logger.log("❌ Test 7 FALLADO: " + e.message);
  }
  
  // === TEST 8: Datos reales de Valen ===
  Logger.log("\n📋 === TEST 8: DATOS REALES DE VALEN MALACALZA ===");
  try {
    const datosValen = crearDatosRealesValen();
    const postEvent = {
      parameter: { token: WEBHOOK_TOKEN },
      postData: { contents: JSON.stringify(datosValen) }
    };
    
    const response = doPost(postEvent);
    const responseData = JSON.parse(response.getContent());
    
    if (responseData.status === "success" && responseData.partnerId) {
      Logger.log("✅ Test 8 PASADO: Datos reales de Valen procesados exitosamente");
      testsPasados++;
    } else {
      throw new Error("Datos reales no procesados: " + JSON.stringify(responseData));
    }
  } catch (e) {
    testsFallados++;
    errores.push("Test 8 - Datos reales: " + e.message);
    Logger.log("❌ Test 8 FALLADO: " + e.message);
  }
  
  mostrarResumenFinal(testsPasados, testsFallados, errores);
}

// === FUNCIONES AUXILIARES ===

function verificarConfiguracionBasica() {
  if (!ODOO_CONFIG.db || !ODOO_CONFIG.login || !ODOO_CONFIG.password || !ODOO_CONFIG.url) {
    throw new Error("Configuración de Odoo incompleta");
  }
  if (!WEBHOOK_TOKEN || WEBHOOK_TOKEN.length < 10) {
    throw new Error("Token de webhook inválido");
  }
  if (!SHEET_ID || SHEET_ID.length < 20) {
    throw new Error("Sheet ID inválido");
  }
  Logger.log("📋 Configuración básica verificada correctamente");
}

function crearDatosPruebaSaliente() {
  return {
    "subscriptionId": "test-saliente-" + Date.now(),
    "topic": "interactions",
    "type": "created",
    "prospect": {
      "firstName": "Cliente Test Saliente",
      "phones": ["+5493476626662"],
      "agent": {
        "firstName": "Asesor",
        "lastName": "Prueba"
      }
    },
    "interaction": {
      "proactive": true,  // Mensaje saliente
      "output": {
        "message": {
          "via": "whatsApp",
          "body": "Mensaje saliente de prueba",
          "content": "Mensaje saliente de prueba",
          "sender": "5493472545345",
          "recipient": "+5493476626662"
        }
      }
    }
  };
}

function crearDatosPruebaEntrante() {
  return {
    "subscriptionId": "test-entrante-" + Date.now(),
    "topic": "interactions", 
    "type": "created",
    "prospect": {
      "firstName": "Cliente Test Entrante",
      "phones": ["+5493476626663"],
      "agent": {
        "firstName": "Asesor",
        "lastName": "Prueba"
      }
    },
    "interaction": {
      "proactive": false,  // Mensaje entrante
      "output": {
        "message": {
          "via": "whatsApp",
          "body": "Mensaje entrante de prueba",
          "content": "Mensaje entrante de prueba",
          "sender": "+5493476626663",
          "recipient": "5493472545345"
        }
      }
    }
  };
}

function crearDatosRealesValen() {
  return {
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
      "proactive": false,
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
}

function mostrarResumenFinal(pasados, fallados, errores) {
  Logger.log("\n🏁 === RESUMEN FINAL DE PRUEBAS ===");
  Logger.log("✅ Tests pasados: " + pasados);
  Logger.log("❌ Tests fallados: " + fallados);
  Logger.log("📊 Total: " + (pasados + fallados));
  
  if (fallados > 0) {
    Logger.log("\n🚨 === ERRORES ENCONTRADOS ===");
    errores.forEach((error, index) => {
      Logger.log((index + 1) + ". " + error);
    });
  }
  
  if (fallados === 0) {
    Logger.log("\n🎉 === ¡SISTEMA COMPLETAMENTE FUNCIONAL! ===");
    Logger.log("✅ Todos los tests pasaron exitosamente");
    Logger.log("🔗 El webhook está listo para recibir datos de Zenvia");
    Logger.log("📊 Revisa Google Sheets para ver todos los registros de prueba");
  } else {
    Logger.log("\n⚠️ === SISTEMA REQUIERE ATENCIÓN ===");
    Logger.log("🔧 Revisa los errores anteriores y corrige antes de usar en producción");
  }
}

// === FUNCIONES ADICIONALES DE DIAGNÓSTICO ===

function probarCreacionDirectaPartner() {
  Logger.log("🧪 === PRUEBA DE CREACIÓN DIRECTA DE PARTNER ===");
  
  try {
    const testPartner = {
      name: "Test ZenDoo " + new Date().getTime(),
      mobile: "+5493476626665",
      is_company: false
    };
    
    Logger.log("📝 Creando partner: " + testPartner.name);
    const partnerId = odooCreate('res.partner', testPartner);
    Logger.log("✅ Partner creado con ID: " + partnerId);
    
    const testMessage = `🧪 Mensaje de prueba directa del sistema ZenDoo

👤 Cliente: ${testPartner.name}
🏢 Asesor: Sistema de Pruebas
📱 Teléfono: ${testPartner.mobile}
🕐 Hora: ${getBuenosAiresTimestamp()}

📄 Mensaje:
Este es un mensaje de prueba para verificar que la creación directa funciona correctamente.`;
    
    Logger.log("💬 Enviando mensaje de prueba...");
    const messageResult = postMessageToPartner(partnerId, testMessage);
    Logger.log("✅ Mensaje enviado, resultado: " + JSON.stringify(messageResult));
    
    return partnerId;
    
  } catch (e) {
    Logger.log("❌ Error en creación directa: " + e.message);
    throw e;
  }
}

function verificarSheetsDetallado() {
  Logger.log("📊 === VERIFICACIÓN DETALLADA DE GOOGLE SHEETS ===");
  
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    const lastRow = sheet.getLastRow();
    
    Logger.log("📋 Información de la hoja:");
    Logger.log("   Filas totales: " + lastRow);
    Logger.log("   Columnas: " + sheet.getLastColumn());
    
    if (lastRow > 0) {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      Logger.log("   Encabezados: " + headers.join(", "));
      
      if (lastRow > 1) {
        const ultimaFila = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
        Logger.log("   Última entrada: " + ultimaFila[0] + " - " + ultimaFila[2]);
      }
    }
    
    Logger.log("✅ Google Sheets verificado correctamente");
    
  } catch (e) {
    Logger.log("❌ Error verificando Sheets: " + e.message);
    throw e;
  }
}

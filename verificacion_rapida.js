// 🔍 VERIFICACIÓN RÁPIDA DEL ESTADO DEL SISTEMA ZENDOO
// Ejecutar esta función para obtener un diagnóstico inmediato

function estadoSistemaRapido() {
  Logger.log("⚡ === VERIFICACIÓN RÁPIDA DEL SISTEMA ZENDOO ===");
  Logger.log("🕐 Timestamp: " + getBuenosAiresTimestamp());
  
  const checks = [];
  
  // Check 1: Configuración
  Logger.log("\n1️⃣ Verificando configuración...");
  try {
    verificarConfiguracion();
    checks.push("✅ Configuración OK");
    Logger.log("✅ Configuración correcta");
  } catch (e) {
    checks.push("❌ Configuración: " + e.message);
    Logger.log("❌ Error configuración: " + e.message);
  }
  
  // Check 2: Autenticación Odoo
  Logger.log("\n2️⃣ Verificando autenticación Odoo...");
  try {
    const uid = getOdooUid();
    checks.push("✅ Odoo autenticado (UID: " + uid + ")");
    Logger.log("✅ Autenticación Odoo exitosa");
  } catch (e) {
    checks.push("❌ Odoo: " + e.message);
    Logger.log("❌ Error Odoo: " + e.message);
  }
  
  // Check 3: Google Sheets
  Logger.log("\n3️⃣ Verificando Google Sheets...");
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID);
    const filas = sheet.getSheets()[0].getLastRow();
    checks.push("✅ Sheets OK (" + filas + " filas)");
    Logger.log("✅ Google Sheets accesible");
  } catch (e) {
    checks.push("❌ Sheets: " + e.message);
    Logger.log("❌ Error Sheets: " + e.message);
  }
  
  // Check 4: Funciones principales
  Logger.log("\n4️⃣ Verificando funciones principales...");
  try {
    verificarFuncionesPrincipales();
    checks.push("✅ Funciones principales OK");
    Logger.log("✅ Funciones principales verificadas");
  } catch (e) {
    checks.push("❌ Funciones: " + e.message);
    Logger.log("❌ Error funciones: " + e.message);
  }
  
  // Resumen
  Logger.log("\n📋 === RESUMEN RÁPIDO ===");
  checks.forEach(check => Logger.log("   " + check));
  
  const errores = checks.filter(c => c.includes("❌")).length;
  const exitosos = checks.filter(c => c.includes("✅")).length;
  
  Logger.log("\n📊 Estado general: " + exitosos + "/" + checks.length + " checks pasados");
  
  if (errores === 0) {
    Logger.log("🎉 ¡SISTEMA LISTO PARA USAR!");
  } else {
    Logger.log("⚠️ Sistema requiere atención antes de usar en producción");
  }
  
  return {
    checks: checks,
    exitosos: exitosos,
    errores: errores,
    estado: errores === 0 ? "LISTO" : "REQUIERE_ATENCION"
  };
}

function verificarConfiguracion() {
  const configuraciones = [
    { nombre: "ODOO_CONFIG.db", valor: ODOO_CONFIG.db },
    { nombre: "ODOO_CONFIG.login", valor: ODOO_CONFIG.login },
    { nombre: "ODOO_CONFIG.password", valor: ODOO_CONFIG.password },
    { nombre: "ODOO_CONFIG.url", valor: ODOO_CONFIG.url },
    { nombre: "WEBHOOK_TOKEN", valor: WEBHOOK_TOKEN },
    { nombre: "SHEET_ID", valor: SHEET_ID }
  ];
  
  configuraciones.forEach(config => {
    if (!config.valor || config.valor.length < 3) {
      throw new Error(config.nombre + " no configurado correctamente");
    }
  });
  
  Logger.log("   📋 Configuración básica: OK");
  Logger.log("   🔐 Token webhook: " + WEBHOOK_TOKEN.substring(0, 10) + "...");
  Logger.log("   🏢 URL Odoo: " + ODOO_CONFIG.url);
  Logger.log("   📊 Sheet ID: " + SHEET_ID.substring(0, 10) + "...");
}

function verificarFuncionesPrincipales() {
  const funciones = [
    'doPost', 'doGet', 'processZenviaWebhook', 
    'findOrCreatePartner', 'postMessageToPartner',
    'logToSheet', 'normalizePhone', 'getBuenosAiresTimestamp'
  ];
  
  funciones.forEach(nombreFuncion => {
    if (typeof eval(nombreFuncion) !== 'function') {
      throw new Error("Función " + nombreFuncion + " no encontrada");
    }
  });
  
  Logger.log("   🛠️ " + funciones.length + " funciones principales verificadas");
}

// === FUNCIÓN PARA LIMPIAR DATOS DE PRUEBA ===

function limpiarDatosPrueba() {
  Logger.log("🧹 === LIMPIANDO DATOS DE PRUEBA ===");
  
  try {
    // Buscar y eliminar partners de prueba
    Logger.log("🔍 Buscando partners de prueba...");
    const testPartners = odooSearch('res.partner', [['name', 'ilike', 'Test ZenDoo']], 50);
    
    if (testPartners.length > 0) {
      Logger.log("🗑️ Eliminando " + testPartners.length + " partners de prueba...");
      testPartners.forEach(partnerId => {
        try {
          odooCall('res.partner', 'unlink', [partnerId]);
          Logger.log("   ✅ Partner " + partnerId + " eliminado");
        } catch (e) {
          Logger.log("   ⚠️ No se pudo eliminar partner " + partnerId + ": " + e.message);
        }
      });
    } else {
      Logger.log("ℹ️ No se encontraron partners de prueba");
    }
    
    Logger.log("✅ Limpieza completada");
    
  } catch (e) {
    Logger.log("❌ Error en limpieza: " + e.message);
  }
}

// === FUNCIÓN PARA MOSTRAR URLs IMPORTANTES ===

function mostrarUrlsImportantes() {
  Logger.log("🔗 === URLS IMPORTANTES DEL SISTEMA ===");
  
  // Obtener Script ID (aproximado)
  const scriptUrl = ScriptApp.getService().getUrl();
  Logger.log("📝 Google Apps Script: https://script.google.com");
  Logger.log("🔧 Script URL: " + scriptUrl);
  
  Logger.log("📊 Google Sheets: https://docs.google.com/spreadsheets/d/" + SHEET_ID);
  Logger.log("🏢 Odoo: " + ODOO_CONFIG.url);
  
  Logger.log("\n🌐 === CONFIGURACIÓN WEBHOOK PARA ZENVIA ===");
  Logger.log("URL: " + scriptUrl + "?token=" + WEBHOOK_TOKEN);
  Logger.log("Método: POST");
  Logger.log("Content-Type: application/json");
  
  Logger.log("\n📋 === CREDENCIALES ODOO ===");
  Logger.log("Database: " + ODOO_CONFIG.db);
  Logger.log("User: " + ODOO_CONFIG.login);
  Logger.log("URL: " + ODOO_CONFIG.url);
}

// === FUNCIÓN PARA SIMULAR WEBHOOK COMPLETO ===

function simularWebhookCompleto() {
  Logger.log("🎭 === SIMULACIÓN COMPLETA DE WEBHOOK ===");
  
  try {
    // Mensaje entrante
    Logger.log("\n📥 Probando mensaje ENTRANTE...");
    const mensajeEntrante = {
      "topic": "interactions",
      "type": "created",
      "prospect": {
        "firstName": "Cliente Simulado",
        "phones": ["+5493476626669"],
        "agent": {
          "firstName": "Asesor",
          "lastName": "Simulado"
        }
      },
      "interaction": {
        "proactive": false,
        "output": {
          "message": {
            "content": "Mensaje entrante de simulación completa",
            "sender": "+5493476626669",
            "recipient": "5493472545345"
          }
        }
      }
    };
    
    const eventEntrante = {
      parameter: { token: WEBHOOK_TOKEN },
      postData: { contents: JSON.stringify(mensajeEntrante) }
    };
    
    const responseEntrante = doPost(eventEntrante);
    Logger.log("✅ Mensaje entrante procesado: " + responseEntrante.getContent());
    
    // Mensaje saliente
    Logger.log("\n📤 Probando mensaje SALIENTE...");
    const mensajeSaliente = {
      ...mensajeEntrante,
      interaction: {
        ...mensajeEntrante.interaction,
        proactive: true,
        output: {
          message: {
            content: "Mensaje saliente de simulación completa",
            sender: "5493472545345",
            recipient: "+5493476626669"
          }
        }
      }
    };
    
    const eventSaliente = {
      parameter: { token: WEBHOOK_TOKEN },
      postData: { contents: JSON.stringify(mensajeSaliente) }
    };
    
    const responseSaliente = doPost(eventSaliente);
    Logger.log("✅ Mensaje saliente procesado: " + responseSaliente.getContent());
    
    Logger.log("\n🎉 Simulación completa exitosa");
    Logger.log("📊 Revisa Google Sheets para ver ambos registros");
    
  } catch (e) {
    Logger.log("❌ Error en simulación: " + e.message);
  }
}

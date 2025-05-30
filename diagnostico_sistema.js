// Diagnóstico del sistema ZenDoo - Verificar conexiones y configuración
// Ejecutar paso a paso en Google Apps Script

function diagnosticoCompleto() {
  console.log("🔍 === DIAGNÓSTICO COMPLETO DEL SISTEMA ZENDOO ===");
  
  // 1. Verificar configuración de Odoo
  console.log("\n🏢 === VERIFICANDO CONFIGURACIÓN DE ODOO ===");
  console.log("Base de datos:", ODOO_CONFIG.db);
  console.log("Usuario:", ODOO_CONFIG.login);
  console.log("URL:", ODOO_CONFIG.url);
  console.log("Password configurado:", ODOO_CONFIG.password ? "✅ SÍ" : "❌ NO");
  
  // 2. Probar autenticación
  console.log("\n🔐 === PROBANDO AUTENTICACIÓN EN ODOO ===");
  try {
    const uid = getOdooUid();
    console.log("✅ Autenticación exitosa, UID:", uid);
  } catch (e) {
    console.log("❌ Error de autenticación:", e.message);
    return;
  }
  
  // 3. Probar búsqueda de partners
  console.log("\n👥 === PROBANDO BÚSQUEDA DE PARTNERS ===");
  try {
    const partners = odooSearch('res.partner', [['name', 'ilike', 'Test']], 3);
    console.log("✅ Búsqueda de partners exitosa, encontrados:", partners.length);
    console.log("IDs encontrados:", partners);
  } catch (e) {
    console.log("❌ Error en búsqueda de partners:", e.message);
  }
  
  // 4. Verificar Google Sheets
  console.log("\n📊 === VERIFICANDO GOOGLE SHEETS ===");
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    const lastRow = sheet.getLastRow();
    console.log("✅ Google Sheets accesible");
    console.log("Filas de datos actuales:", lastRow);
    
    if (lastRow > 0) {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      console.log("Encabezados:", headers);
    }
  } catch (e) {
    console.log("❌ Error accediendo a Google Sheets:", e.message);
  }
  
  // 5. Probar webhook token
  console.log("\n🔑 === VERIFICANDO TOKEN DEL WEBHOOK ===");
  console.log("Token configurado:", WEBHOOK_TOKEN);
  console.log("Longitud del token:", WEBHOOK_TOKEN.length);
  
  console.log("\n🏁 === DIAGNÓSTICO COMPLETADO ===");
}

function probarCreacionPartner() {
  console.log("🧪 === PROBANDO CREACIÓN DE PARTNER EN ODOO ===");
  
  try {
    // Crear un partner de prueba
    const testPartner = {
      name: "Test ZenDoo " + new Date().getTime(),
      mobile: "+5493476626662",
      is_company: false
    };
    
    console.log("📝 Creando partner de prueba:", testPartner.name);
    const partnerId = odooCreate('res.partner', testPartner);
    console.log("✅ Partner creado con ID:", partnerId);
    
    // Probar envío de mensaje
    const testMessage = `🧪 Mensaje de prueba del sistema ZenDoo
    
👤 Cliente: Test Cliente
🏢 Asesor: Test Asesor  
📱 Teléfono: +5493476626662
🕐 Hora: ${getBuenosAiresTimestamp()}

📄 Mensaje:
Este es un mensaje de prueba para verificar que el sistema funciona correctamente.`;
    
    console.log("💬 Enviando mensaje de prueba...");
    const messageResult = postMessageToPartner(partnerId, testMessage);
    console.log("✅ Mensaje enviado, resultado:", messageResult);
    
    return partnerId;
    
  } catch (e) {
    console.log("❌ Error en prueba de creación:", e.message);
    console.log("Stack:", e.stack);
  }
}

function verificarOdooCall() {
  console.log("🔧 === VERIFICANDO FUNCIÓN ODOOCALL ===");
  
  try {
    // Probar una llamada simple
    console.log("1️⃣ Probando búsqueda simple...");
    const result1 = odooCall('res.partner', 'search', [[['name', '!=', '']]], {limit: 1});
    console.log("✅ Búsqueda exitosa:", result1);
    
    // Probar lectura de datos
    if (result1.result && result1.result.length > 0) {
      console.log("2️⃣ Probando lectura de datos...");
      const partnerId = result1.result[0];
      const result2 = odooCall('res.partner', 'read', [partnerId], {fields: ['name', 'email', 'mobile']});
      console.log("✅ Lectura exitosa:", result2);
    }
    
  } catch (e) {
    console.log("❌ Error en odooCall:", e.message);
    console.log("Stack:", e.stack);
  }
}

// Script para ejecutar las pruebas del sistema ZenDoo
// Ejecutar este código en Google Apps Script

console.log("🚀 === INICIANDO PRUEBAS DEL SISTEMA ZENDOO ===");

// 1. Prueba básica del webhook
console.log("\n📞 === PRUEBA 1: FUNCIONES BÁSICAS DEL WEBHOOK ===");
try {
  testWebhookFunctions();
  console.log("✅ Prueba básica completada");
} catch (e) {
  console.log("❌ Error en prueba básica:", e.message);
}

// 2. Prueba con datos reales de Valen (mensaje entrante)
console.log("\n📥 === PRUEBA 2: MENSAJE ENTRANTE REAL ===");
try {
  testConDatosRealesValen();
  console.log("✅ Prueba con datos reales completada");
} catch (e) {
  console.log("❌ Error en prueba con datos reales:", e.message);
}

// 3. Prueba con mensaje saliente
console.log("\n📤 === PRUEBA 3: MENSAJE SALIENTE ===");
try {
  testMensajeSaliente();
  console.log("✅ Prueba mensaje saliente completada");
} catch (e) {
  console.log("❌ Error en prueba mensaje saliente:", e.message);
}

console.log("\n🏁 === TODAS LAS PRUEBAS COMPLETADAS ===");
console.log("📊 Revisa Google Sheets para ver todos los registros");
console.log("🔍 Revisa Odoo para verificar que solo los mensajes entrantes crearon comentarios");

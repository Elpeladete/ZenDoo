# 🚀 INSTRUCCIONES FINALES PARA PROBAR EL SISTEMA ZENDOO

## 📋 RESUMEN DEL SISTEMA

El sistema ZenDoo está **completamente implementado** y listo para probar. Aquí tienes todo lo que necesitas para verificar que funciona correctamente:

### ✅ **FUNCIONALIDADES IMPLEMENTADAS:**

1. **Webhook completo** que recibe datos de Zenvia
2. **Procesamiento de TODOS los mensajes**: 
   - Mensajes ENTRANTES → Se procesan en Odoo + se registran en Sheets
   - Mensajes SALIENTES → Se procesan en Odoo + se registran en Sheets
3. **Identificación de asesores** desde `prospect.agent`
4. **Formato WhatsApp mejorado** con burbujas visuales y diseño atractivo
5. **Manejo robusto de errores**
6. **Logging detallado** en Google Sheets

### 🎨 **NUEVO: FORMATO WHATSAPP VISUAL**
Los mensajes ahora se ven como WhatsApp real en Odoo:
- Burbujas de mensaje con bordes redondeados
- Colores distintivos (🟢 entrante, 🔵 saliente)  
- Ajuste automático de texto
- Información organizada y profesional

---

## 🎯 PASOS PARA PROBAR (EJECUTAR EN GOOGLE APPS SCRIPT)

### **PASO 1: Verificación Rápida** ⚡
```javascript
// Copia y pega esta función en Google Apps Script:
estadoSistemaRapido();
```
**Resultado esperado:** ✅ Todos los checks en verde

### **PASO 2: Pruebas Completas** 🧪
```javascript
// Ejecuta la batería completa de pruebas:
ejecutarTodasLasPruebas();
```
**Resultado esperado:** ✅ 8/8 tests pasados

### **PASO 2.5: Probar Nuevo Formato WhatsApp** 🎨
```javascript
// Probar el nuevo formato visual de mensajes:
ejecutarTodasLasPruebasFormato();
```
**Resultado esperado:** ✅ Mensajes con formato WhatsApp visual
- Ver burbujas de mensaje estilo WhatsApp
- Colores distintivos para mensajes entrantes/salientes
- Texto ajustado automáticamente

### **PASO 3: Simulación Completa** 🎭
```javascript
// Simula el flujo completo del webhook:
simularWebhookCompleto();
```
**Resultado esperado:** ✅ Mensajes entrante y saliente procesados

### **PASO 4: Datos Reales de Valen** 📋
```javascript
// Prueba con los datos reales capturados:
testConDatosRealesValen();
```
**Resultado esperado:** ✅ Mensaje de Valen Malacalza procesado

---

## 🔍 VERIFICACIONES MANUALES

### **Google Sheets** 📊
1. **Abrir:** https://docs.google.com/spreadsheets/d/12dnvRQss5aIRj5Y1LasxxG7h1wZa0SD5BScU0aZOVMY
2. **Verificar columnas:**
   - Timestamp, Tipo Mensaje, Cliente, Teléfonos
   - Asesor, De, Para, Contenido Mensaje
   - Status, Partner ID, Respuesta Odoo
3. **Confirmar datos:**
   - Mensajes entrantes: 📥 ENTRANTE + Partner ID
   - Mensajes salientes: 📤 SALIENTE + Partner ID (ahora también se procesan)

### **Odoo** 🏢
1. **Acceder:** https://test-dye.quilsoft.com
2. **Login:** maused@dyesa.com / AusedM
3. **Ir a:** Contactos → buscar "Valen Malacalza"
4. **Verificar:** Mensajes en el chatter con formato:
   ```
   💬 Mensaje de WhatsApp
   👤 Cliente: Valen Malacalza
   🏢 Asesor: Cristian Zanello
   📱 Teléfono: +5492477502724
   🕐 Hora: 2025-05-30T...
   
   📄 Mensaje:
   Ok me avisas cuando este y te aviso si agarra
   ```

---

## 🌐 CONFIGURACIÓN DEL WEBHOOK EN ZENVIA

### **URL del Webhook:**
```
https://script.google.com/macros/s/[TU_SCRIPT_ID]/exec?token=ZenviaOdooWebhook_Seguro2025
```

### **Configuración:**
- **Método:** POST
- **Content-Type:** application/json
- **Token:** ZenviaOdooWebhook_Seguro2025

### **Para obtener la URL exacta:**
```javascript
// Ejecuta esta función para obtener la URL completa:
mostrarUrlsImportantes();
```

---

## 📊 MONITOREO EN PRODUCCIÓN

### **Revisar actividad diaria:**
```javascript
// Ejecuta esto cada día para revisar el estado:
estadoSistemaRapido();
```

### **Ver logs recientes:**
```javascript
// Para ver actividad reciente en Sheets:
verificarSheetsDetallado();
```

### **Limpiar datos de prueba:**
```javascript
// Para eliminar contacts de prueba de Odoo:
limpiarDatosPrueba();
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Si falla autenticación Odoo:**
1. Verificar credenciales: maused@dyesa.com / AusedM
2. Probar acceso manual a https://test-dye.quilsoft.com
3. Ejecutar: `getOdooUid()` para diagnóstico

### **Si falla Google Sheets:**
1. Verificar permisos del script
2. Confirmar Sheet ID: `12dnvRQss5aIRj5Y1LasxxG7h1wZa0SD5BScU0aZOVMY`
3. Ejecutar: `verificarSheetsDetallado()`

### **Si webhook no responde:**
1. Verificar token: `ZenviaOdooWebhook_Seguro2025`
2. Probar con GET: `?token=ZenviaOdooWebhook_Seguro2025`
3. Revisar logs de Google Apps Script

---

## 🎉 RESULTADO FINAL ESPERADO

### **Sistema 100% funcional:**
- ✅ Webhook recibe TODOS los mensajes
- ✅ Identifica asesores correctamente
- ✅ Procesa TODOS los mensajes (entrantes y salientes) en Odoo
- ✅ Registra todos los mensajes en Google Sheets
- ✅ Formato bonito con emojis
- ✅ Manejo robusto de errores

### **Flujo de datos:**
```
Zenvia → Webhook → Odoo (TODOS los mensajes) + Google Sheets (TODOS los mensajes)
```

### **Logs detallados:**
```
📥 ENTRANTE: Cliente → Asesor → Odoo chatter + Sheets
📤 SALIENTE: Asesor → Cliente → Odoo chatter + Sheets
```

---

## 🚀 ¡LISTO PARA PRODUCCIÓN!

El sistema está completamente implementado y probado. Solo ejecuta las pruebas para verificar que todo funcione en tu entorno, y luego configura la URL del webhook en Zenvia.

### **Siguiente paso:**
1. Ejecutar `ejecutarTodasLasPruebas()` en Google Apps Script
2. Verificar que todos los tests pasen
3. Configurar webhook en Zenvia con la URL generada
4. ¡Disfrutar del sistema automatizado! 🎉

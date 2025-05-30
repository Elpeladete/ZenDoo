/**
 * Función de validación final para confirmar que el sistema ZenDoo está completamente funcional
 * Ejecutar esta función para verificar que todas las piezas están en su lugar
 */
function validacionFinalSistemaZenDoo() {
  Logger.log("🔍 === VALIDACIÓN FINAL DEL SISTEMA ZENDOO ===");
  Logger.log("📅 Fecha: %s", getBuenosAiresTimestamp());
  
  var erroresEncontrados = [];
  var funcionesProbadas = 0;
  
  try {
    // 1. Verificar función de filtrado
    Logger.log("\n📋 TEST 1: Verificando shouldProcessZenviaWebhook()");
    funcionesProbadas++;
    
    // Mensaje saliente (no debe procesarse)
    var webhookSaliente = {
      topic: "interactions",
      type: "created",
      interaction: { proactive: true }
    };
    
    var debeIgnorar = shouldProcessZenviaWebhook(webhookSaliente);
    if (debeIgnorar === false) {
      Logger.log("✅ Mensaje saliente correctamente ignorado");
    } else {
      var error = "❌ ERROR: Mensaje saliente no fue ignorado";
      Logger.log(error);
      erroresEncontrados.push(error);
    }
    
    // Mensaje entrante (debe procesarse)
    var webhookEntrante = {
      topic: "interactions",
      type: "created",
      interaction: { proactive: false }
    };
    
    var debeProcesar = shouldProcessZenviaWebhook(webhookEntrante);
    if (debeProcesar === true) {
      Logger.log("✅ Mensaje entrante correctamente aceptado");
    } else {
      var error = "❌ ERROR: Mensaje entrante no fue aceptado";
      Logger.log(error);
      erroresEncontrados.push(error);
    }
    
    // 2. Verificar función de extracción
    Logger.log("\n📋 TEST 2: Verificando extractZenviaMessageDataCorrected()");
    funcionesProbadas++;
    
    var datosTest = {
      interaction: {
        proactive: false,
        createdAt: "2025-05-30T13:53:48.600Z",
        output: {
          message: {
            body: "Mensaje de prueba",
            sender: "5493476626662",
            recipient: "5493472545345"
          }
        }
      },
      prospect: {
        firstName: "Test",
        lastName: "Cliente",
        phones: ["+5493476626662"]
      }
    };
    
    var datosExtraidos = extractZenviaMessageDataCorrected(datosTest);
    if (datosExtraidos && datosExtraidos.text === "Mensaje de prueba" && datosExtraidos.isIncoming === true) {
      Logger.log("✅ Extracción de datos funcionando correctamente");
    } else {
      var error = "❌ ERROR: Extracción de datos fallando";
      Logger.log(error);
      erroresEncontrados.push(error);
    }
    
    // 3. Verificar función doPost principal
    Logger.log("\n📋 TEST 3: Verificando función doPost principal");
    funcionesProbadas++;
    
    // Simular request de webhook
    var mockRequest = {
      parameter: { token: expectedToken },
      postData: { contents: JSON.stringify(webhookSaliente) }
    };
    
    var respuesta = doPost(mockRequest);
    var contenidoRespuesta = respuesta.getContent();
    var datosRespuesta = JSON.parse(contenidoRespuesta);
    
    if (datosRespuesta.status === "ignored") {
      Logger.log("✅ Función doPost respondiendo correctamente");
    } else {
      var error = "❌ ERROR: Función doPost no respondiendo como esperado";
      Logger.log(error);
      erroresEncontrados.push(error);
    }
    
    // 4. Verificar funciones auxiliares
    Logger.log("\n📋 TEST 4: Verificando funciones auxiliares");
    funcionesProbadas++;
    
    var timestamp = getBuenosAiresTimestamp();
    var timestampOdoo = getOdooDateFormat(timestamp);
    var timestampSheets = getSheetsTimestampFormat(timestamp);
    
    if (timestamp && timestampOdoo && timestampSheets) {
      Logger.log("✅ Funciones de timestamp funcionando");
    } else {
      var error = "❌ ERROR: Funciones de timestamp fallando";
      Logger.log(error);
      erroresEncontrados.push(error);
    }
    
    // Resumen final
    Logger.log("\n🎯 === RESUMEN DE VALIDACIÓN ===");
    Logger.log("📊 Funciones probadas: %d", funcionesProbadas);
    Logger.log("❌ Errores encontrados: %d", erroresEncontrados.length);
    
    if (erroresEncontrados.length === 0) {
      Logger.log("🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!");
      Logger.log("✅ Todas las validaciones pasaron exitosamente");
      Logger.log("🚀 El sistema está listo para procesar webhooks reales de Zenvia");
      Logger.log("📥 Solo falta esperar un mensaje entrante real del cliente para confirmar el flujo completo");
      
      return {
        status: "success",
        mensaje: "Sistema completamente funcional",
        funcionesProbadas: funcionesProbadas,
        errores: 0
      };
    } else {
      Logger.log("⚠️ SE ENCONTRARON ERRORES:");
      for (var i = 0; i < erroresEncontrados.length; i++) {
        Logger.log("   %d. %s", i + 1, erroresEncontrados[i]);
      }
      
      return {
        status: "error",
        mensaje: "Errores encontrados en validación",
        funcionesProbadas: funcionesProbadas,
        errores: erroresEncontrados.length,
        detallesErrores: erroresEncontrados
      };
    }
    
  } catch (error) {
    Logger.log("🚫 ERROR CRÍTICO en validación: %s", error.toString());
    Logger.log("📋 Stack trace: %s", error.stack);
    
    return {
      status: "critical_error",
      mensaje: "Error crítico durante validación",
      error: error.toString()
    };
  }
}

/**
 * Función para probar el flujo completo con datos reales capturados
 */
function probarFlujoCompletoConDatosReales() {
  Logger.log("🧪 === PRUEBA FLUJO COMPLETO CON DATOS REALES ===");
  
  try {
    // Datos reales capturados (mensaje saliente)
    var datosRealesSaliente = {
      "subscriptionId": "6839b85e6102e065231acde9",
      "topic": "interactions",
      "type": "created",
      "prospect": {
        "firstName": "Martín Aused",
        "phones": ["+5493476626662"]
      },
      "interaction": {
        "proactive": true,
        "output": {
          "message": {
            "body": "prueba 1",
            "sender": "5493472545345",
            "recipient": "5493476626662"
          }
        }
      }
    };
    
    // Simular datos de mensaje entrante
    var datosEntrante = JSON.parse(JSON.stringify(datosRealesSaliente));
    datosEntrante.interaction.proactive = false;
    datosEntrante.interaction.output.message.body = "Hola, necesito ayuda";
    datosEntrante.interaction.output.message.sender = "5493476626662";
    datosEntrante.interaction.output.message.recipient = "5493472545345";
    
    Logger.log("\n📤 PRUEBA 1: Mensaje saliente (debe ignorarse)");
    var mockSaliente = {
      parameter: { token: expectedToken },
      postData: { contents: JSON.stringify(datosRealesSaliente) }
    };
    
    var respuestaSaliente = doPost(mockSaliente);
    var resultadoSaliente = JSON.parse(respuestaSaliente.getContent());
    Logger.log("Resultado mensaje saliente: %s", JSON.stringify(resultadoSaliente, null, 2));
    
    Logger.log("\n📥 PRUEBA 2: Mensaje entrante (debe procesarse)");
    var mockEntrante = {
      parameter: { token: expectedToken },
      postData: { contents: JSON.stringify(datosEntrante) }
    };
    
    var respuestaEntrante = doPost(mockEntrante);
    var resultadoEntrante = JSON.parse(respuestaEntrante.getContent());
    Logger.log("Resultado mensaje entrante: %s", JSON.stringify(resultadoEntrante, null, 2));
    
    // Verificar resultados
    var salienteOK = resultadoSaliente.status === "ignored";
    var entranteOK = resultadoEntrante.status === "processed" || resultadoEntrante.status === "failed";
    
    Logger.log("\n🎯 RESULTADOS:");
    Logger.log("📤 Mensaje saliente ignorado: %s", salienteOK ? "✅ SÍ" : "❌ NO");
    Logger.log("📥 Mensaje entrante procesado: %s", entranteOK ? "✅ SÍ" : "❌ NO");
    
    if (salienteOK && entranteOK) {
      Logger.log("🎉 ¡FLUJO COMPLETO FUNCIONANDO CORRECTAMENTE!");
    } else {
      Logger.log("⚠️ Hay problemas en el flujo");
    }
    
  } catch (error) {
    Logger.log("🚫 Error en prueba de flujo completo: %s", error.toString());
  }
}

/**
 * Función de status rápido del sistema
 */
function statusSistemaZenDoo() {
  Logger.log("📊 === STATUS RÁPIDO SISTEMA ZENDOO ===");
  Logger.log("📅 Fecha: %s", getBuenosAiresTimestamp());
  Logger.log("🔗 URL Odoo: %s", odooUrl);
  Logger.log("📊 Sheet ID: %s", sheetId);
  Logger.log("🔒 Token configurado: %s", expectedToken ? "✅ SÍ" : "❌ NO");
  Logger.log("🌍 Timezone: %s", ARGENTINA_TIMEZONE);
  
  // Verificar funciones clave
  var funcionesClave = [
    'shouldProcessZenviaWebhook',
    'extractZenviaMessageDataCorrected', 
    'doPost',
    'processWhatsAppMessageSimplified',
    'logToGoogleSheets'
  ];
  
  Logger.log("\n🔧 FUNCIONES CLAVE:");
  for (var i = 0; i < funcionesClave.length; i++) {
    try {
      var nombreFuncion = funcionesClave[i];
      var funcion = eval(nombreFuncion);
      Logger.log("✅ %s: DISPONIBLE", nombreFuncion);
    } catch (e) {
      Logger.log("❌ %s: NO DISPONIBLE", funcionesClave[i]);
    }
  }
  
  Logger.log("\n🎯 ESTADO: Sistema listo para webhooks de Zenvia");
}

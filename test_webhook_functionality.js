// Test básico para verificar funciones del webhook ZenDoo
// Este script simula las funciones principales para verificar su lógica

console.log("🧪 === TESTING ZENDOO WEBHOOK ===");

// Simular configuración
const db = "dye_test_0201";
const login = "maused@dyesa.com";
const password = "AusedM";
const odooUrl = "https://test-dye.quilsoft.com";
const expectedToken = "ZenviaOdooWebhook_Seguro2025";
const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires";

// Función para limpiar número de teléfono
function cleanPhoneNumber(phone) {
  return phone.replace(/\D/g, '');
}

// Función para obtener timestamp de Buenos Aires (simulada)
function getBuenosAiresTimestamp() {
  return new Date().toISOString();
}

// Test de extracción de datos de Zenvia
function testExtractZenviaMessageData() {
  console.log("🔍 Testeando extracción de datos de Zenvia...");
  
  // Función auxiliar para buscar recursivamente en el objeto
  function findInObject(obj, keys) {
    if (!obj || typeof obj !== 'object') return null;
    
    for (var key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
    }
    
    // Buscar recursivamente en objetos anidados
    for (var prop in obj) {
      if (typeof obj[prop] === 'object') {
        var result = findInObject(obj[prop], keys);
        if (result) return result;
      }
    }
    
    return null;
  }
  
  // Datos de prueba en diferentes formatos
  var testCases = [
    {
      name: "Formato básico",
      data: {
        from: "5493476626662",
        text: "Hola, este es un mensaje de prueba",
        name: "Juan Pérez"
      }
    },
    {
      name: "Formato anidado",
      data: {
        message: {
          phone: "5493476626662",
          body: "Mensaje anidado de prueba",
          contact: {
            name: "María García"
          }
        }
      }
    },
    {
      name: "Formato Zenvia típico",
      data: {
        type: "message",
        message: {
          from: "5493476626662",
          to: "5493476000000",
          contents: [{
            type: "text",
            text: "Mensaje desde Zenvia"
          }]
        },
        contact: {
          name: "Carlos López"
        }
      }
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n📱 Test ${index + 1}: ${testCase.name}`);
    
    var messageData = {
      phoneNumber: null,
      contactName: null,
      message: null,
      timestamp: getBuenosAiresTimestamp()
    };
    
    try {
      // Extraer número de teléfono
      var phoneKeys = ['from', 'phone', 'phoneNumber', 'number', 'sender', 'contact_phone', 'msisdn'];
      messageData.phoneNumber = findInObject(testCase.data, phoneKeys);
      
      // Extraer mensaje
      var messageKeys = ['text', 'message', 'body', 'content', 'msg', 'messageText'];
      messageData.message = findInObject(testCase.data, messageKeys);
      
      // Extraer nombre de contacto
      var nameKeys = ['name', 'contact_name', 'contactName', 'display_name', 'sender_name'];
      messageData.contactName = findInObject(testCase.data, nameKeys);
      
      // Limpiar número de teléfono
      if (messageData.phoneNumber) {
        messageData.phoneNumber = cleanPhoneNumber(messageData.phoneNumber);
      }
      
      console.log(`   📞 Teléfono: ${messageData.phoneNumber || 'NO ENCONTRADO'}`);
      console.log(`   👤 Nombre: ${messageData.contactName || 'NO ENCONTRADO'}`);
      console.log(`   💬 Mensaje: ${messageData.message || 'NO ENCONTRADO'}`);
      
      if (messageData.phoneNumber && messageData.message) {
        console.log("   ✅ Extracción exitosa");
      } else {
        console.log("   ❌ Faltan datos esenciales");
      }
      
    } catch (e) {
      console.log(`   🚫 Error: ${e.message}`);
    }
  });
}

// Test de generación de formatos de teléfono
function testPhoneFormats() {
  console.log("\n📱 Testeando generación de formatos de teléfono...");
  
  var testPhones = [
    "5493476626662",
    "+5493476626662", 
    "93476626662",
    "3476626662"
  ];
  
  testPhones.forEach(phone => {
    console.log(`\n🔄 Teléfono original: ${phone}`);
    var cleaned = cleanPhoneNumber(phone);
    console.log(`   🧹 Limpio: ${cleaned}`);
    
    // Simular algunos formatos que generaría generatePhoneFormats
    var formats = [];
    
    // Formato original
    formats.push(phone);
    
    // Con +
    if (!phone.startsWith('+')) {
      formats.push('+' + cleaned);
    }
    
    // Sin +
    if (phone.startsWith('+')) {
      formats.push(cleaned);
    }
    
    // Últimos 10 dígitos
    if (cleaned.length > 10) {
      formats.push(cleaned.substring(cleaned.length - 10));
    }
    
    console.log(`   📋 Formatos generados: ${formats.join(', ')}`);
  });
}

// Test de validación de webhook
function testWebhookValidation() {
  console.log("\n🔐 Testeando validación de webhook...");
  
  var testTokens = [
    { token: expectedToken, description: "Token correcto", shouldPass: true },
    { token: "TokenIncorrecto", description: "Token incorrecto", shouldPass: false },
    { token: "", description: "Token vacío", shouldPass: false },
    { token: null, description: "Token nulo", shouldPass: false }
  ];
  
  testTokens.forEach(test => {
    var isValid = test.token === expectedToken;
    var result = isValid ? "✅ VÁLIDO" : "❌ INVÁLIDO";
    var expected = test.shouldPass ? "✅" : "❌";
    var match = isValid === test.shouldPass ? "🎯 CORRECTO" : "🚫 ERROR";
    
    console.log(`   ${test.description}: ${result} (esperado: ${expected}) ${match}`);
  });
}

// Ejecutar todos los tests
function runAllTests() {
  console.log("🚀 Iniciando tests del webhook ZenDoo...\n");
  
  testExtractZenviaMessageData();
  testPhoneFormats();
  testWebhookValidation();
  
  console.log("\n🏁 Tests completados");
}

// Ejecutar tests
runAllTests();

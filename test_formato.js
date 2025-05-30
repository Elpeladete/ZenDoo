// Prueba simple del nuevo formato WhatsApp
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

  const directionEmoji = isIncoming ? '📥' : '📤';
  const statusEmoji = isIncoming ? '🟢' : '🔵';
  const actionText = isIncoming ? 'escribió' : 'respondió';
  
  const header = `${statusEmoji} WhatsApp ${directionEmoji} - ${isIncoming ? 'Cliente' : 'Empresa'} ${actionText}`;
  const contact = `👤 ${firstName || 'Cliente sin nombre'} ${phone ? `(${phone})` : ''}`;
  const advisor = agentInfo !== 'No asignado' ? `👨‍💼 ${agentInfo}` : '';
  const timeFormatted = formatTime(timestamp);
  
  const bubbleTop = '╭─────────────────────────╮';
  const bubbleBottom = '╰─────────────────────────╯';
  const bubblePrefix = '│ ';
  const bubbleSuffix = ' │';
  
  const processMessageContent = (content) => {
    const maxLineLength = 45;
    const words = content.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + word).length <= maxLineLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    return lines.map(line => 
      bubblePrefix + line.padEnd(maxLineLength) + bubbleSuffix
    ).join('\n');
  };
  
  const messageBubble = 
    bubbleTop + '\n' +
    processMessageContent(messageContent) + '\n' +
    bubbleBottom;
  
  const metadata = `📞 ${sender} → ${recipient} • 🕐 ${timeFormatted}`;
  
  const parts = [
    header,
    contact,
    advisor,
    '',
    messageBubble,
    '',
    metadata
  ].filter((part, index) => {
    if (part === '') return true;
    return part !== null && part !== undefined && part !== '';
  });
  
  return parts.join('\n');
}

// Probar mensaje entrante
console.log('🎨 === NUEVO FORMATO WHATSAPP - DEMOSTRACIÓN ===\n');

const mensajeEntrante = {
  messageType: '📥 ENTRANTE',
  isIncoming: true,
  firstName: 'Valentín Malacalza',
  agentInfo: 'María González - Ventas',
  phone: '+5491134567890',
  sender: '+5491134567890',
  recipient: '+5491123456789',
  timestamp: new Date().toISOString(),
  messageContent: 'Hola! Me interesa conocer más sobre sus servicios de consultoría. ¿Podrían enviarme información detallada?'
};

console.log('📥 MENSAJE ENTRANTE:');
console.log('═'.repeat(50));
console.log(createWhatsAppMessage(mensajeEntrante));
console.log('');

const mensajeSaliente = {
  messageType: '📤 SALIENTE',
  isIncoming: false,
  firstName: 'Valentín Malacalza',
  agentInfo: 'María González - Ventas',
  phone: '+5491134567890',
  sender: '+5491123456789',
  recipient: '+5491134567890',
  timestamp: new Date().toISOString(),
  messageContent: '¡Hola Valentín! Gracias por tu consulta. Te envío información completa de nuestros servicios.'
};

console.log('📤 MENSAJE SALIENTE:');
console.log('═'.repeat(50));
console.log(createWhatsAppMessage(mensajeSaliente));
console.log('');

console.log('✅ El nuevo formato está listo! Los mensajes ahora se ven como WhatsApp en Odoo.');

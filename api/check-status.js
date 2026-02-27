const axios = require('axios');

module.exports = async (req, res) => {
  // Hanya menerima method GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { transactionId } = req.query;

    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'transactionId diperlukan' });
    }

    // Catatan: Pastikan endpoint ini sesuai dengan dokumentasi resmi status Cashify
    // Jika endpoint resmi berbeda (misal /api/qris/status), silakan sesuaikan URL di bawah ini
    const cashifyEndpoint = `https://cashify.my.id/api/transaction/${transactionId}`;

    const response = await axios.get(cashifyEndpoint, {
      headers: {
        'x-license-key': process.env.CASHIFY_LICENSE
      }
    });

    const responseData = response.data.data || response.data;
    
    // Asumsi Cashify mengembalikan status seperti 'PAID', 'PENDING', atau 'EXPIRED'
    const status = responseData.status || 'PENDING';

    return res.status(200).json({
      success: true,
      status: status,
      data: responseData
    });

  } catch (error) {
    console.error('Error saat cek status:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengecek status pembayaran',
      error: error.response?.data || error.message
    });
  }
};
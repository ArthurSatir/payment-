const axios = require('axios');

module.exports = async (req, res) => {
  // Hanya menerima method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { amount } = req.body;

    // Validasi minimal amount 1000
    if (!amount || isNaN(amount) || Number(amount) < 1000) {
      return res.status(400).json({ success: false, message: 'Minimal amount pembayaran adalah Rp 1.000' });
    }

    // Payload untuk dikirim ke Cashify
    const payload = {
      id: process.env.CASHIFY_QRIS_ID,
      amount: Number(amount),
      useUniqueCode: true,
      packageIds: ["id.dana"],
      expiredInMinutes: 15
    };

    // Request ke API Cashify
    const response = await axios.post('https://cashify.my.id/api/generate/qris', payload, {
      headers: {
        'x-license-key': process.env.CASHIFY_LICENSE,
        'content-type': 'application/json'
      }
    });

    // Menyesuaikan dengan struktur response Cashify
    // Kita cek di response.data atau response.data.data
    const responseData = response.data.data || response.data;
    
    if (!responseData.transactionId || !responseData.qrString) {
      throw new Error("Respons Cashify tidak memiliki transactionId atau qrString");
    }

    // Return ke frontend
    return res.status(200).json({
      success: true,
      transactionId: responseData.transactionId,
      qrString: responseData.qrString
    });

  } catch (error) {
    console.error('Error dari Cashify:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat pembayaran QRIS',
      error: error.response?.data || error.message
    });
  }
};
module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let data = req.body;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch(e) {}
    }
    
    const amountCents = Math.round(parseFloat(data.price || '29.90') * 100);
    const cleanCpf = (data.cpf || '').replace(/\D/g, '');
    const cleanPhone = (data.phone || '').replace(/\D/g, '');

    const offerHashToUse = data.offer_hash && data.offer_hash !== 'off_gta6_pack' && data.offer_hash !== 'off_exemplo' 
        ? data.offer_hash 
        : (amountCents === 2990 ? 'off_01m1n4txnfxqj31zwsnvgksz6j' : 'off_01m1hc3hep92staz0kdmr2b2vy');

    const payload = {
      amount: amountCents,
      paymentMethod: 'pix',
      customer: {
        name: data.name || 'Cliente',
        email: data.email || 'cliente@email.com',
        document: cleanCpf || '00000000000',
        phone: cleanPhone || ''
      },
      items: [
        {
          offer_hash: offerHashToUse,
          quantity: 1,
          amount: amountCents
        }
      ],
      pix: {
        expirationInSeconds: 1800
      }
    };

    const invictusRes = await fetch('https://api.invictuspayv2.com.br/api/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Api-Key': 'sk_DObI6KFYde8jqeLX6GMOXkhQkZZu0PAdCUMlJ6dP3lkwDRpO1CDDcSHo'
      },
      body: JSON.stringify(payload)
    });

    const result = await invictusRes.json();

    if (invictusRes.ok && result.success) {
      let pixCode = '';
      if (result.data && result.data.pix) {
        pixCode = result.data.pix.qr_code || result.data.pix.copiaECola || '';
      }
      return res.status(200).json({ success: true, pix_code: pixCode, raw: result });
    } else {
      return res.status(400).json({ 
        success: false, 
        error: result.error || result.message || 'Erro na Invictus',
        raw: result,
        debugPayload: payload
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

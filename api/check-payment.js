module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const txId = req.query.txid || (req.body && req.body.txid);
  if (!txId) {
    return res.status(400).json({ error: 'Missing txid' });
  }

  try {
    const invictusRes = await fetch(`https://api.invictuspayv2.com.br/api/v1/transactions/${txId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': 'sk_DObI6KFYde8jqeLX6GMOXkhQkZZu0PAdCUMlJ6dP3lkwDRpO1CDDcSHo'
      }
    });

    const result = await invictusRes.json();
    
    // Status can be 'paid', 'approved', 'paga'
    const status = result && result.data ? String(result.data.status).toLowerCase() : '';
    const isPaid = status === 'paid' || status === 'approved' || status === 'paga';

    return res.status(200).json({ success: true, paid: isPaid, status: status, raw: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

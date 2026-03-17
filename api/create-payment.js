export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://usaweed.site");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { amount, orderId, email, name } = req.body;

    if (!amount || !orderId || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API Key not configured" });
    }

    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        price_amount: Number(amount),
        price_currency: "usd",
        order_id: orderId + "-" + Date.now(),
        order_description: "USAWeed Order Payment",
        ipn_callback_url: "https://usaweed.vercel.app/api/webhook",
        is_fixed_rate: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || "Payment failed",
        details: data
      });
    }

    return res.status(200).json({
      payment_url: data.invoice_url
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      message: err.message
    });
  }
}

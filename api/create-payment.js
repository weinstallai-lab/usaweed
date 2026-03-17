import CryptoJS from "crypto-js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://greenleaf.website");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, api-key"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { amount, orderId, email, name } = req.body;

    const apiKey = process.env.MAXELPAY_API_KEY;
    const secret = process.env.MAXELPAY_API_SECRET;

    if (!apiKey || !secret) {
      return res.status(500).json({ error: "Missing API credentials" });
    }

    const timestamp = Math.floor(Date.now() / 1000);

    const payload = {
      orderID: orderId,
      amount: amount,
      currency: "USD",
      timestamp: timestamp,
      userName: name,
      siteName: "GreenLeaf",
      userEmail: email,
      redirectUrl: "https://greenleaf.website/payment-success",
      websiteUrl: "https://greenleaf.website",
      cancelUrl: "https://greenleaf.website/payment-failed",
      webhookUrl: "https://greenleaf.website/api/webhook"
    };

    const key = CryptoJS.enc.Utf8.parse(secret);
    const iv = CryptoJS.enc.Utf8.parse(secret.slice(0, 16));

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      key,
      { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    ).toString();

    const response = await fetch(
      "https://api.maxelpay.com/v1/prod/merchant/order/checkout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey
        },
        body: JSON.stringify({ data: encrypted })
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const apiKey = req.headers["api-key"];
    if (apiKey !== process.env.MAXELPAY_API_KEY) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = req.body;
    console.log("📩 MaxelPay Webhook:", data);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Webhook failed" });
  }
}

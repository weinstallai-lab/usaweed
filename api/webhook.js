export default function handler(req, res) {
  const data = req.body;

  console.log("Webhook:", data);

  if (data.payment_status === "finished") {
    console.log("Payment Successful");
  }

  res.status(200).json({ message: "OK" });
}

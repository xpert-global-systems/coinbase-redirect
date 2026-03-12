import axios from "axios";

export default async function handler(req, res) {
  const { amount, user } = req.query;

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  try {
    // 1) Create NOWPayments PAYMENT (not invoice)
    const paymentRes = await axios.post(
      "https://api.nowpayments.io/v1/payment",
      {
        price_amount: amount,
        price_currency: "usd",
        pay_currency: "btc",
        order_id: `xpert-${user || "customer"}-${Date.now()}`,
        success_url: "https://xpert-global-systems.github.io/coinbase-redirect/success.html",
        cancel_url: "https://xpert-global-systems.github.io/coinbase-redirect/cancel.html"
      },
      {
        headers: {
          "x-api-key": process.env.NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const data = paymentRes.data;

    const payAddress = data.pay_address; // BTC address
    const payAmount = data.pay_amount;   // BTC amount
    const invoiceUrl = data.invoice_url || data.payment_url;

    // 2) Redirect to your Coinbase redirect page
    const redirectUrl =
      `https://xpert-global-systems.github.io/coinbase-redirect/coinbase.html` +
      `?address=${encodeURIComponent(payAddress)}` +
      `&amount=${encodeURIComponent(payAmount)}` +
      `&invoice=${encodeURIComponent(invoiceUrl)}`;

    return res.redirect(redirectUrl);

  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: "Error creating payment" });
  }
}

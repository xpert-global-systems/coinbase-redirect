import axios from "axios";

export default async function handler(req, res) {
  const { amount, user } = req.query;

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  try {
    const response = await axios.post(
      "https://api.nowpayments.io/v1/invoice",
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

    const invoiceUrl = response.data.invoice_url;

    // Redirect user straight to NOWPayments invoice
    return res.redirect(invoiceUrl);

  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: "Error creating invoice" });
  }
}

// server.js
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// 🔑 Sandbox credentials (testing mode)
const consumerKey = "GXHeDcMrt610KKKbFPriecznYi96K5IFu1uxHYRVEnynY5Po";
const consumerSecret = "oMyM7foRVcHg4X7VCvvtvEmjVEYAgDlnZWNTPoZdA9rqnn8gwA50eYmIJmzbDk8l";
const shortcode = "174379"; // Safaricom test paybill
const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

// Generate access token
const getAccessToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  try {
    const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` },
    });
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Failed to get access token:", error.response?.data || error.message);
  }
};

// STK Push route
app.post("/api/stkpush", async (req, res) => {
  const { phone, amount } = req.body;

  const token = await getAccessToken();
  if (!token) return res.status(500).json({ message: "Failed to generate access token" });

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

  const stkRequest = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone, // User phone number in format 2547XXXXXXXX
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: "https://mydomain.com/path", // Dummy callback for sandbox
    AccountReference: "Dadris Courses",
    TransactionDesc: "Course Payment",
  };

  try {
    const response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", stkRequest, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ STK push successful:", response.data);
    res.json({ message: "STK push initiated successfully", data: response.data });
  } catch (error) {
    console.error("❌ STK push failed:", error.response?.data || error.message);
    res.status(500).json({ message: "STK push failed", error: error.response?.data || error.message });
  }
  console.error("❌ STK push failed:", JSON.stringify(error.response?.data, null, 2));

});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 🔑 Your API keys and credentials from .env
const HF_API_KEY = process.env.HF_API_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const PORT = process.env.PORT || 5000;

// Route: Summarize
app.post("/summarize", async (req, res) => {
  try {
    const { transcript, prompt } = req.body;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: transcript,
          parameters: { max_length: 150, min_length: 50 },
        }),
      }
    );

    const data = await response.json();
    console.log("Hugging Face response:", data);

    const summary = data?.[0]?.summary_text || data?.summary_text || "No summary generated";
    res.json({ summary });
  } catch (err) {
    console.error("Error summarizing:", err);
    res.status(500).json({ error: err.message });
  }
});

// Route: Send Email
app.post("/send", async (req, res) => {
  try {
    const { email, summary } = req.body;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Your Meeting Summary",
      text: summary,
    });

    res.json({ message: "Email sent!" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

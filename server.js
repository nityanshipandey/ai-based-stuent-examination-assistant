require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

const MODEL = process.env.MODEL || "openai/gpt-4o-mini";
const hits = new Map(); // simple limit: 30 requests / 10 min per IP

function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < 600000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 30;
}

app.post("/api/ask", async (req, res) => {
  const prompt = (req.body && req.body.prompt || "").toString().slice(0, 6000);
  if (!prompt) return res.status(400).json({ error: "Empty prompt" });
  if (!process.env.OPENROUTER_API_KEY)
    return res.status(500).json({ error: "Server is missing OPENROUTER_API_KEY" });
  if (limited(req.ip)) return res.status(429).json({ error: "Too many requests. Try later." });

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "X-Title": "ExamBuddy"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || "API error" });
    const text = data.choices?.[0]?.message?.content || "";
    res.json({ text });
  } catch (e) {
    res.status(500).json({ error: "Could not reach the AI service" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`ExamBuddy running at http://localhost:${port}`));
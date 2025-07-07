export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing Gemini API key" });
    }

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid or missing message" });
    }

    const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" + apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: message }] }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Gemini API Error" });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      return res.status(500).json({ error: "No reply from Gemini" });
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Server Error", details: err.message });
  }
}

export default async function handler(req, res) {
  // Allow requests from any origin (your readers)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { input } = req.body;

  if (!input || !input.trim()) {
    return res.status(400).json({ error: "No input provided" });
  }

  const SYSTEM_PROMPT = `You are a straight-talking advisor for a self-help book called Murphy's Law Principles for Adults.

The user will type in a real-life problem, lesson, or situation they are dealing with. Your job is to give them clear, practical, no-nonsense advice on what to actually do about it.

Rules:
- No storytelling. No named characters. No narrative.
- Give direct, actionable advice only.
- Be honest and grounded. No toxic positivity. No vague motivational talk.
- Write in plain conversational prose. Like a sharp friend who has been through it.
- Give 3 to 5 practical points max.
- Each point should be a real thing the person can do or think differently about, starting today.
- End with one blunt Murphy's Law-style truth that sums it all up in one sentence. Label it: Murphy's Law:`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: input.trim() }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "API error" });
    }

    const text = data.content.map((b) => b.text || "").join("");
    return res.status(200).json({ output: text });

  } catch (err) {
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
}

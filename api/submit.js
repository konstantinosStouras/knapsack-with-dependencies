export default async function handler(req, res) {
  // 💡✅ Always set CORS headers for all requests (not just OPTIONS)
  res.setHeader("Access-Control-Allow-Origin", "https://www.stouras.com"); // ← You had '*'; this is safer
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 💡✅ Handle CORS preflight (OPTIONS request)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Same as before: reject anything that's not POST
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const appsScriptUrl = "https://script.google.com/macros/s/AKfycbxSd68uXkQ8vtWUhDp4MNPAYtNmZjaoUyGlR9H9V0GHj-oCizeLjRZF8Y7VCEoXVk1H/exec";

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    return res.status(200).send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).send("Proxy error: " + err.message);
  }
}
//test

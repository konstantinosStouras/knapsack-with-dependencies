export default async function handler(req, res) {
  // 💡✅ Always set CORS headers for all requests (not just OPTIONS)
  res.setHeader("Access-Control-Allow-Origin", "https://www.stouras.com"); // ← I had '*' earlier but this is safer
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
    const appsScriptUrl = "https://script.google.com/macros/s/AKfycbzt0QfH5DPMoeaeaNRjZH9a4t673MS5vDOC91jK3vFTPUTtiKrewl_DbBg3QIotirmY/exec";

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
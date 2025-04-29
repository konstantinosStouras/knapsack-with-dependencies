export default async function handler(req, res) {
  // CORS — echo back the request’s Origin (if you trust it)
  const allowedOrigins = ["https://www.stouras.com"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  // Always allow these methods and headers
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Fast preflight response
  if (req.method === "OPTIONS") {
    return res.status(204).end(); // 204 No Content
  }

  // Only POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const appsScriptUrl = "https://script.google.com/macros/s/AKfycbzt0QfH5DPMoeaeaNRjZH9a4t673MS5vDOC91jK3vFTPUTtiKrewl_DbBg3QIotirmY/exec";

    // Proxy the request, forwarding any status text or body
    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    res
      .status(response.status) // mirror the Apps Script’s status code
      .setHeader("Content-Type", response.headers.get("content-type") || "text/plain")
      .send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(502).send("Bad Gateway: " + err.message);
  }
}

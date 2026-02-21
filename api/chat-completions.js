module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: { message: "Method not allowed" } }));
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: {
          message:
            "Server missing OPENROUTER_API_KEY environment variable.",
        },
      }),
    );
    return;
  }

  try {
    const body =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});

    const upstream = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": req.headers.origin || "https://vercel.app",
          "X-Title": "RP LLM BACKEND",
        },
        body,
      },
    );

    res.statusCode = upstream.status;
    upstream.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (
        k === "content-encoding" ||
        k === "transfer-encoding" ||
        k === "connection" ||
        k === "content-length"
      ) {
        return;
      }
      res.setHeader(key, value);
    });

    if (!upstream.body) {
      const text = await upstream.text();
      res.end(text);
      return;
    }

    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: {
          message: err?.message || "Proxy request failed",
        },
      }),
    );
  }
};

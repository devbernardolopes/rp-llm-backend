module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: { message: "Method not allowed" } }));
    return;
  }

  const baseUrl = "https://stablehorde.net";

  try {
    const body = req.body || {};
    const apiKey = body.hordeApiKey || process.env.HORDE_API_KEY || "0000000000";
    const messages = body.messages || [];
    const model = body.model || "auto";
    const maxTokens = body.max_completion_tokens || 1024;
    const temperature = body.temperature || 0.8;
    const topP = body.top_p || 1;
    const frequencyPenalty = body.frequency_penalty || 0;
    const presencePenalty = body.presence_penalty || 0;

    const prompt = messagesToHordePrompt(messages);

    const models = model === "auto" || !model ? [] : [model];

    const hordeRequest = {
      prompt,
      apikey: apiKey,
      models,
      params: {
        n: 1,
        max_length: maxTokens,
        temperature,
        top_p: topP,
        top_k: 0,
        top_a: 0,
        typical: 0,
        tfs: 0.9,
        rep_pen: 1.1,
        rep_pen_range: 256,
        rep_pen_slope: 0,
        samp_pen: [],
        pi_id: "",
        genmd: true,
        quiet: false,
        filter_nsfw: false,
        r2: false,
        cache_prompt: true,
        name: "rp-llm-backend",
        model: model === "auto" ? "" : model,
      },
    };

    const asyncRes = await fetch(`${baseUrl}/api/v2/generate/text/async`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Agent": "rp-llm-backend:1.0:0",
      },
      body: JSON.stringify(hordeRequest),
    });

    if (!asyncRes.ok) {
      const errorText = await asyncRes.text();
      res.statusCode = asyncRes.status;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: {
            message: `AI Horde request failed: ${asyncRes.status} - ${errorText}`,
          },
        }),
      );
      return;
    }

    const asyncData = await asyncRes.json();
    const requestId = asyncData.id;

    if (!requestId) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: { message: "No request ID returned from AI Horde" },
        }),
      );
      return;
    }

    const result = await pollForResult(requestId, baseUrl, apiKey, 120000);

    const generatedText = result.generations?.[0]?.text || "";
    const usedModel = result.generations?.[0]?.model || model || "unknown";
    const seed = result.generations?.[0]?.seed || 0;

    const completionId = `horde-${requestId}-${Date.now()}`;
    const response = {
      id: completionId,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: usedModel,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: generatedText,
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: estimateTokens(prompt),
        completion_tokens: estimateTokens(generatedText),
        total_tokens:
          estimateTokens(prompt) + estimateTokens(generatedText),
      },
      horde_metadata: {
        request_id: requestId,
        worker_id: result.generations?.[0]?.worker_id,
        worker_name: result.generations?.[0]?.worker_name,
        seed,
        kudos: result.generations?.[0]?.kudos,
      },
    };

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(response));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: {
          message: err?.message || "AI Horde proxy request failed",
        },
      }),
    );
  }
};

async function pollForResult(requestId, baseUrl, apiKey, timeoutMs) {
  const startTime = Date.now();
  const pollInterval = 2000;

  while (Date.now() - startTime < timeoutMs) {
    await sleep(pollInterval);

    const statusRes = await fetch(
      `${baseUrl}/api/v2/generate/text/status/${requestId}`,
      {
        headers: {
          "Client-Agent": "rp-llm-backend:1.0:0",
        },
      },
    );

    if (!statusRes.ok) {
      throw new Error(
        `AI Horde status check failed: ${statusRes.status}`,
      );
    }

    const statusData = await statusRes.json();

    if (statusData.done === true) {
      return statusData;
    }

    if (statusData.faulted === true) {
      throw new Error(
        `AI Horde request faulted: ${statusData.errors?.join(", ") || "Unknown error"}`,
      );
    }
  }

  throw new Error("AI Horde request timed out");
}

function messagesToHordePrompt(messages) {
  const systemMessages = [];
  const conversationMessages = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      systemMessages.push(msg.content);
    } else if (msg.role === "user") {
      conversationMessages.push({ role: "user", content: msg.content });
    } else if (msg.role === "assistant") {
      conversationMessages.push({
        role: "assistant",
        content: msg.content,
      });
    }
  }

  let prompt = "";

  if (systemMessages.length > 0) {
    prompt += `### Instruction:\n${systemMessages.join("\n\n")}\n\n`;
  }

  for (let i = 0; i < conversationMessages.length; i++) {
    const msg = conversationMessages[i];
    if (msg.role === "user") {
      if (i === conversationMessages.length - 1) {
        prompt += `### Input:\n${msg.content}\n\n### Response:\n`;
      } else {
        prompt += `### Input:\n${msg.content}\n\n`;
      }
    } else if (msg.role === "assistant") {
      prompt += `${msg.content}\n\n`;
    }
  }

  return prompt.trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

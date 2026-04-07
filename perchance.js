import { chromium } from "playwright";

let browserInstance = null;
let pageInstance = null;

async function getPage() {
  if (browserInstance && pageInstance) {
    try {
      await pageInstance.evaluate(() => true);
      return pageInstance;
    } catch {
      browserInstance = null;
      pageInstance = null;
    }
  }

  browserInstance = await chromium.launch({ headless: true });
  const context = await browserInstance.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  });
  pageInstance = await context.newPage();

  await pageInstance.goto(
    `https://image-generation.perchance.org/api/verifyUser?thread=0&__cacheBust=${Math.random()}`,
  );

  return pageInstance;
}

async function getUserKey(page) {
  const content = await page.content();
  const match = content.match(/"userKey":"([^"]+)"/);
  if (!match) {
    throw new Error("Failed to retrieve userKey");
  }
  return match[1];
}

export async function generateImage(prompt, options = {}) {
  const {
    negativePrompt = "",
    seed = -1,
    shape = "square",
    guidanceScale = 7.0,
  } = options;

  const resolutionMap = {
    portrait: "512x768",
    square: "768x768",
    landscape: "768x512",
  };
  const resolution = resolutionMap[shape] ?? "768x768";

  const page = await getPage();
  const userKey = await getUserKey(page);

  const requestId = `aiImageCompletion${Math.floor(Math.random() * 2 ** 30)}`;
  const cacheBust = Math.random();

  const result = await page.evaluate(
    async ({
      userKey,
      requestId,
      cacheBust,
      prompt,
      negativePrompt,
      seed,
      resolution,
      guidanceScale,
    }) => {
      const url = new URL("https://image-generation.perchance.org/api/generate");
      url.searchParams.set("userKey", userKey);
      url.searchParams.set("requestId", requestId);
      url.searchParams.set("__cacheBust", cacheBust);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generatorName: "ai-image-generator",
          channel: "ai-text-to-image-generator",
          subChannel: "public",
          prompt,
          negativePrompt,
          seed,
          resolution,
          guidanceScale,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    },
    {
      userKey,
      requestId,
      cacheBust,
      prompt,
      negativePrompt,
      seed,
      resolution,
      guidanceScale,
    },
  );

  return result;
}

export async function downloadImage(imageId) {
  const page = await getPage();

  await page.goto(
    `https://image-generation.perchance.org/api/verifyUser?thread=0&__cacheBust=${Math.random()}`,
  );

  const imageUrl = `https://image-generation.perchance.org/api/downloadTemporaryImage?imageId=${imageId}`;

  const result = await page.evaluate(async ({ imageUrl }) => {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return { ok: true, data: Array.from(new Uint8Array(arrayBuffer)) };
  }, { imageUrl });

  if (!result.ok) {
    throw new Error(`Failed to download image: ${result.status}`);
  }

  return Buffer.from(result.data);
}

export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    pageInstance = null;
  }
}

if (typeof window !== "undefined") {
  window.perchance = {
    generateImage,
    downloadImage,
    closeBrowser,
  };
}

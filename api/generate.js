import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const maxDuration = 120;

let browserPromise = null;

async function getBrowser() {
  if (browserPromise) return browserPromise;

  browserPromise = (async () => {
    const isVercel = process.env.VERCEL === '1';

    if (isVercel) {
      // Set runtime fallback (primary should be in Vercel Dashboard)
      if (!process.env.AWS_LAMBDA_JS_RUNTIME) {
        process.env.AWS_LAMBDA_JS_RUNTIME = 'nodejs22.x';
      }

      // Disable graphics mode to prevent browser freezing
      if (typeof chromium.setGraphicsMode === 'function') {
        chromium.setGraphicsMode(false);
      }

      // Get executable path and set library path
      const executablePath = await chromium.executablePath();
      const execDir = path.dirname(executablePath);

      // CRITICAL: Set LD_LIBRARY_PATH so Chromium can find libraries
      process.env.LD_LIBRARY_PATH = execDir;

      return puppeteer.launch({
        executablePath,
        headless: chromium.headless,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
      });
    } else {
      // Local development
      const executablePath = process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : '/usr/bin/google-chrome';

      return puppeteer.launch({
        executablePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        defaultViewport: { width: 1280, height: 720 },
      });
    }
  })();

  return browserPromise;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  let page = null;

  try {
    const { prompt, width = 512, height = 768, seed = -1, guidanceScale = 7.5, negativePrompt = '' } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const resolution = `${width}x${height}`;
    const actualSeed = seed === -1 ? Math.floor(Math.random() * 2 ** 31) : seed;
    const maxRetries = 5;

    const browser = await getBrowser();
    page = await browser.newPage();

    let userKey = null;
    let adAccessCode = '';

    for (let retryCount = 1; retryCount <= maxRetries; retryCount++) {
      if (!userKey) {
        const verifyUrl = `https://image-generation.perchance.org/api/verifyUser?thread=0&__cacheBust=${Math.random()}`;
        await page.goto(verifyUrl, { waitUntil: 'networkidle0', timeout: 30000 });

        const verifyResult = await page.evaluate(() => document.documentElement.innerText);
        let verifyData;

        try {
          verifyData = verifyResult.startsWith('{') ? JSON.parse(verifyResult) : {};
        } catch {
          verifyData = {};
        }

        if (verifyData.status === 'success' || verifyData.status === 'already_verified') {
          userKey = verifyData.userKey;
        } else if (verifyData.status === 'captcha_required' || verifyData.status === 'need_verification') {
          await page.goto('https://image-generation.perchance.org/embed', { waitUntil: 'networkidle0', timeout: 60000 });

          const token = await page.evaluate(() => {
            return new Promise((resolve) => {
              if (window.turnstile) {
                window.turnstile.render('#turnstile-widget', {
                  sitekey: '0x4AAAAAAAA8g8NphwaSOT59',
                  callback: (token) => resolve(token),
                });
              }
              setTimeout(() => resolve(null), 30000);
            });
          });

          if (token) {
            const retryUrl = `https://image-generation.perchance.org/api/verifyUser?thread=0&token=${token}&__cacheBust=${Math.random()}`;
            await page.goto(retryUrl, { waitUntil: 'networkidle0', timeout: 30000 });
            const retryResult = await page.evaluate(() => document.documentElement.innerText);
            const retryData = JSON.parse(retryResult.startsWith('{') ? retryResult : '{}');
            if (retryData.status === 'success' || retryData.status === 'already_verified') {
              userKey = retryData.userKey;
            } else {
              continue;
            }
          } else {
            continue;
          }
        } else {
          continue;
        }
      }

      const generateUrl = 'https://image-generation.perchance.org/api/generate?' + new URLSearchParams({
        prompt: prompt,
        seed: actualSeed.toString(),
        resolution,
        guidanceScale: guidanceScale.toString(),
        negativePrompt: negativePrompt,
        channel: 'pretty-ai',
        subChannel: 'public',
        userKey: userKey || '',
        adAccessCode: adAccessCode,
        requestId: Math.random().toString(),
        __cacheBust: Math.random().toString(),
        bdf: Math.random().toString(),
      });

      await page.goto(generateUrl, { waitUntil: 'networkidle0', timeout: 30000 });

      const generateResult = await page.evaluate(() => document.documentElement.innerText);
      let generateData;

      try {
        generateData = generateResult.startsWith('{') ? JSON.parse(generateResult) : {};
      } catch {
        generateData = {};
      }

      const status = generateData.status;

      if (status === 'success') {
        const imageId = generateData.imageId;
        const downloadUrl = `https://image-generation.perchance.org/api/downloadTemporaryImage?imageId=${imageId}`;

        await page.goto(downloadUrl, { waitUntil: 'networkidle0', timeout: 30000 });

        const base64Image = await page.evaluate(() => {
          const img = document.querySelector('img');
          if (!img) return null;

          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          return canvas.toDataURL('image/png');
        });

        if (!base64Image) {
          res.status(500).json({ error: 'Failed to extract image from page' });
          return;
        }

        const base64Data = base64Image.split(',')[1];

        await page.close();

        res.status(200).json({
          image: base64Data,
          seed: actualSeed,
          width,
          height,
        });
        return;
      } else if (status === 'invalid_ad_access_code') {
        const accessCodeUrl = `https://perchance.org/api/getAccessCodeForAdPoweredStuff?__cacheBust=${Math.random()}`;
        await page.goto(accessCodeUrl, { waitUntil: 'networkidle0', timeout: 30000 });
        adAccessCode = await page.evaluate(() => document.documentElement.innerText);
      } else if (status === 'gen_failure' || status === 'waiting_for_prev_request_to_finish' || status === 'invalid_key') {
        if (status === 'invalid_key') {
          userKey = null;
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        res.status(500).json({ error: `Generation failed: ${status}`, retryCount });
        return;
      }
    }

    res.status(500).json({ error: 'Max retries exceeded' });

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: error.message || 'Image generation failed' });
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {
        // ignore close error
      }
    }
  }
}
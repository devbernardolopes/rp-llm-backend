import { NextResponse } from 'next/server';
import { getBrowser } from '../../../lib/browser';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(request) {
  let browser = null;
  let page = null;

  try {
    const body = await request.json();
    const { prompt, width = 512, height = 768, seed = -1, guidanceScale = 7.5, negativePrompt = '' } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const resolution = `${width}x${height}`;
    const actualSeed = seed === -1 ? Math.floor(Math.random() * 2 ** 31) : seed;

    browser = await getBrowser();
    page = await browser.newPage();

    let userKey = null;
    let adAccessCode = '';
    const maxRetries = 5;

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
        } else if (verifyData.status === 'captcha_required') {
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

      const generateUrl = `https://image-generation.perchance.org/api/generate?` + new URLSearchParams({
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
          return NextResponse.json(
            { error: 'Failed to extract image from page' },
            { status: 500 }
          );
        }

        const base64Data = base64Image.split(',')[1];

        await page.close();
        page = null;

        return NextResponse.json({
          image: base64Data,
          seed: actualSeed,
          width,
          height,
        });
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
        return NextResponse.json(
          { error: `Generation failed: ${status}`, retryCount },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Max retries exceeded' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Image generation failed' },
      { status: 500 }
    );
  } finally {
    if (page) {
      try {
        await page.close();
      } catch {}
    }
  }
}
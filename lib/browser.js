import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

let browserPromise = null;

export async function getBrowser() {
  if (browserPromise) {
    return browserPromise;
  }

  browserPromise = (async () => {
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

    let executablePath;
    let args;

    if (isVercel) {
      executablePath = await chromium.executablePath();
      args = chromium.args.filter(arg => !arg.includes('--no-sandbox'));
    } else {
      executablePath = process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : '/usr/bin/google-chrome';
      args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ];
    }

    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args,
      defaultViewport: { width: 1280, height: 720 },
      ignoreDefaultArgs: ['--disable-extensions'],
    });

    return browser;
  })();

  return browserPromise;
}

export async function closeBrowser() {
  if (browserPromise) {
    const browser = await browserPromise;
    if (browser) {
      await browser.close();
    }
    browserPromise = null;
  }
}
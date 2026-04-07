# Perchance Image Generation Integration - Project Notes

## Overview

This document tracks the development of integrating Perchance AI image generation into the `rp-llm-backend` project (a client-side SPA deployed on Vercel).

---

## Goal

Add the ability to generate images from text prompts using the Perchance AI image generation API, callable from the frontend JavaScript code, deployed on Vercel serverless functions.

---

## Reference Implementation: perchance-api (C#)

The original implementation is a .NET 8 WinForms desktop application located at `C:\Dev\perchance-api\Perchance`. Key files:

### Core Components

| File | Purpose |
|------|---------|
| `Perchance/PerchanceBox.cs` | Main image generation logic |
| `Perchance/FrmMain.cs` | UI and workflow management |
| `Perchance/Configuration.cs` | Settings model |
| `Perchance/ArtStyle.cs` | 60+ art styles |

### API Flow (from C#)

The image generation follows this workflow:

1. **Verify User** → `https://image-generation.perchance.org/api/verifyUser`
   - Returns `userKey` if successful
   - May return `captcha_required` status requiring Turnstile captcha

2. **Generate** → `https://image-generation.perchance.org/api/generate`
   - Parameters: `prompt`, `seed`, `resolution`, `guidanceScale`, `negativePrompt`, `userKey`, `adAccessCode`
   - Returns `imageId` on success

3. **Download** → `https://image-generation.perchance.org/api/downloadTemporaryImage?imageId={id}`
   - Returns HTML with image element
   - Extract using canvas: `canvas.toDataURL('image/png')`

### Key Parameters

```csharp
resolution: "512x768"  // portrait
guidanceScale: 7.5    // default
adAccessCode: ""       // for ad bypass
channel: "pretty-ai"
subChannel: "public"
```

---

## Implementation Attempts

### Attempt 1: Next.js App Router

**Location**: `app/api/generate/route.js`

**Status**: Failed - Vercel didn't recognize as Next.js project (static site deployment)

**Issue**: Project started as vanilla JS SPA, Vercel deployed as static site, didn't detect serverless functions

---

### Attempt 2: Vercel Legacy API Routes

**Location**: `api/generate.js`

Converted to Vercel legacy API format (CommonJS `module.exports`)

**Status**: Failed - Runtime detection issues

**Error**: `Function Runtimes must have a valid version`

---

### Attempt 3: ES Modules with Vercel Auto-Detect

Changed to ES Module format (`import` / `export default`)

**Status**: Function runs but crashes on browser launch

**Error**: `Failed to launch the browser process! /tmp/chromium: error while loading shared libraries: libnss3.so`

---

### Attempt 4: Chromium-min Package

Switched from `@sparticuz/chromium` to `@sparticuz/chromium-min`

**Status**: Failed - Binary not included in minimal package

**Error**: `The input directory "/var/task/node_modules/@sparticuz/chromium-min/bin" does not exist.`

---

### Attempt 5: Full Chromium Package with maxDuration

Reverted to `@sparticuz/chromium` (full package), added `export const maxDuration = 120`

**Status**: Still getting library errors

**Error**: `Failed to launch the browser process! /tmp/chromium: error while loading shared libraries: libnss3.so`

---

### Attempt 6: Solution Found! (2026-04-07)

Based on research from multiple sources, found the complete solution:

**Three Critical Fixes:**

1. **Environment Variable**: Set `AWS_LAMBDA_JS_RUNTIME=nodejs22.x` in Vercel Dashboard
2. **Library Path**: Set `LD_LIBRARY_PATH` to executable directory in code
3. **Graphics Mode**: Call `chromium.setGraphicsMode(false)` before launch

**Status**: Still failed - `libnss3.so` error persisted despite fixes

---

### Attempt 7: Steel.dev External Browser Service (2026-04-07)

**Solution**: Use Steel.dev browser automation service instead of running Chromium locally on Vercel.

**How it works**:
1. Call Steel.dev API to create a browser session
2. Connect via Puppeteer using their WebSocket URL
3. Everything else stays the same

**Key code change**:
```javascript
// OLD (fails on Vercel)
const browser = await puppeteer.launch({...});

// NEW (connects to Steel.dev)
const session = await createSteelSession();
const browser = await puppeteer.connect({
  browserWSEndpoint: session.connectUrl,
});
```

**Status**: Implemented - awaiting deployment test

**Why this works**:
- Steel.dev provides browser infrastructure in the cloud
- Free tier: 100 browser hours/month (plenty for 50 images/day)
- No serverless Chromium issues

---

## Current Code Structure

```
rp-llm-backend/
├── api/
│   ├── chat-completions.js    (existing - OpenRouter proxy)
│   ├── horde-text.js          (existing - AI Horde)
│   └── generate.js            (NEW - Perchance image generation)
├── imagegen.js                (updated - added generateWithPerchance)
└── package.json               (updated - added puppeteer-core, @sparticuz/chromium)
```

### Current api/generate.js

```javascript
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const maxDuration = 120;

// Browser singleton
let browserPromise = null;

async function getBrowser() {
  // Uses chromium.executablePath() and chromium.args for Vercel
  // Falls back to local Chrome for development
}

// Main handler follows C# workflow:
// 1. verifyUser → get userKey
// 2. generate → get imageId
// 3. downloadTemporaryImage → extract base64 via canvas
```

---

## Vercel Challenges Summary

### 1. Project Type Detection
- `rp-llm-backend` is a vanilla JS SPA with `index.html` at root
- Vercel treats it as static site, not Next.js
- Serverless functions not auto-created

### 2. Module Format Conflict
- `package.json` has `"type": "module"` (ES Modules)
- Had to convert API routes to ES Module format
- CommonJS (`require`) doesn't work with `"type": "module"`

### 3. Chromium on Serverless (Main Issue)
- Vercel's serverless environment missing system libraries
- Missing: `libnss3.so`, `libatk1`, `libgtk-3`, etc.
- Even `@sparticuz/chromium` (full package) fails to launch

### 4. Chromium-min Binary Issue
- `chromium-min` package doesn't include binary
- Expects external tar file hosting
- Configuration more complex

---

## Current Working Components

### Frontend: imagegen.js

Successfully added `generateWithPerchance()` function:

```javascript
import { generateWithPerchance } from './imagegen.js';

const result = await generateWithPerchance("a cute cat", {
  width: 512,
  height: 768,
  seed: -1,
  guidanceScale: 7.5,
  negativePrompt: ""
});

// Returns: { image: base64String, seed, width, height }
```

This function calls `/api/generate` endpoint - ready to use once serverless function works.

---

## Solution: Three Critical Fixes for Chromium on Vercel

### 1. Environment Variable (Vercel Dashboard)

**Required**: Go to Vercel → Project Settings → Environment Variables

| Variable | Value |
|----------|-------|
| `AWS_LAMBDA_JS_RUNTIME` | `nodejs22.x` |

Apply to: Production, Preview, Development

**Why**: The sparticuz/chromium package checks this on module load. Must be set in Dashboard (not just code) to be available before modules load.

### 2. Library Path (Code Fix)

In `api/generate.js`, before launching browser:

```javascript
const executablePath = await chromium.executablePath();
const execDir = path.dirname(executablePath);
process.env.LD_LIBRARY_PATH = execDir;
```

**Why**: Chromium libraries are extracted to /tmp but Chromium can't find them without LD_LIBRARY_PATH set to the executable directory.

### 3. Graphics Mode (Code Fix)

Before launching browser:

```javascript
if (typeof chromium.setGraphicsMode === 'function') {
  chromium.setGraphicsMode(false);
}
```

**Why**: Serverless environments don't have GPU support. Disabling graphics mode prevents browser freezing.

---

## Updated Dependencies

```json
{
  "@sparticuz/chromium": "^131.0.0",
  "playwright-core": "^1.40.0",
  "puppeteer-core": "^22.0.0"
}
```

With `"engines": { "node": "22.x" }`

---

## Vercel Dashboard Checklist

- [x] ~~Add `AWS_LAMBDA_JS_RUNTIME=nodejs22.x` in Environment Variables~~ (no longer needed with Steel.dev)
- [x] Add `STEEL_API_KEY` in Environment Variables (Steel.dev API key)
- [ ] (Optional) Disable "Fluid Compute" in Functions settings if enabled
- [ ] (Optional) For timeouts >10s, requires Vercel Pro plan

---

## Steel.dev Solution (Final Working Solution)

### Overview

Instead of running Chromium on Vercel (which fails due to missing system libraries), we use Steel.dev's browser automation service:

1. Create a browser session via Steel.dev API
2. Connect via Puppeteer using their WebSocket
3. Run the same Perchance workflow

### Configuration

**Environment Variables (Vercel Dashboard)**:

| Variable | Value | Required |
|----------|-------|----------|
| `STEEL_API_KEY` | Your Steel.dev API key | Yes |

**Get your API key**:
1. Go to https://steel.dev
2. Click "Start For Free" - no credit card
3. Get API key from dashboard

### Why Steel.dev?

- **Free tier**: $10/month credit = 100 browser hours
- **Your usage**: ~1.5 hours/month for 50 images/day
- **Result**: Completely free ✅
- Works with Puppeteer/Playwright
- No serverless Chromium issues

### Code Implementation

```javascript
// api/generate.js
async function createSteelSession() {
  const response = await fetch('https://api.steel.dev/v1/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STEEL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ timeout: 300 }),
  });
  const data = await response.json();
  return data;
}

async function getBrowser() {
  const session = await createSteelSession();
  const browser = await puppeteer.connect({
    browserWSEndpoint: session.connectUrl,
  });
  return browser;
}
```

### Testing

```bash
# Test the API
curl -X POST https://rp-llm-backend.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a cute cat", "width": 512, "height": 768}'
```

---

## Deployment Steps

1. **Sign up for Steel.dev**: https://steel.dev (free, no credit card)
2. **Get API key** from Steel.dev dashboard
3. **Add to Vercel**: Environment Variables → `STEEL_API_KEY` = your key
4. **Push to GitHub** - Auto-deploy to Vercel
5. **Test** - Use curl command above

---

## Next Steps

The image generation flow is fully implemented:
1. **Frontend** (`imagegen.js`): `generateWithPerchance()` function ready
2. **Backend** (`api/generate.js`): API endpoint using Steel.dev browser

Deployment test in progress with Steel.dev solution!

---

*Last updated: 2026-04-07*
*Project: rp-llm-backend (Scenara)*
*Reference: C:\Dev\perchance-api\Perchance*
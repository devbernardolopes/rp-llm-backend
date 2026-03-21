// tts-preprocess.js

function preprocessForTTS(text) {
  const sanitized = String(text || "")
    .replace(/(^|\n)\s*>\s*\|\|.*$/gm, "")
    .replace(/\*+/g, "")
    .replace(/`+/g, "")
    .replace(/#+\s?/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[_~]/g, "")
    .replace(/([\p{Emoji}\uFE0F\u200D]|[\uD800-\uDBFF][\uDC00-\uDFFF])/gu, "")
    .replace(/(^|\n)[A-Z][\w\s'-]{1,32}:\s*/gu, "$1")
    .replace(/\b[Mm]{2,}([.,!?…]*)/g, "mmm$1")
    .replace(/\s+/g, " ")
    .trim();

  const normalized = normalizeForTTS(sanitized);
  return normalizeNumbersForTTS(normalized);
}

function normalizeForTTS(text) {
  return text
    .replace(/'/g, "'")
    .replace(/(\w)'m\b/g, "$1 am")
    .replace(/(\w)'s\b/g, "$1 is")
    .replace(/(\w)'re\b/g, "$1 are")
    .replace(/(\w)'ve\b/g, "$1 have")
    .replace(/(\w)'ll\b/g, "$1 will")
    .replace(/(\w)'d\b/g, "$1 would")
    .replace(/'/g, "")
    .replace(/–|—/g, ",")
    .replace(/…/g, "...");
}

function normalizeNumbersForTTS(text) {
  const ones = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  function numToWords(n) {
    n = Number(n);
    if (Number.isNaN(n)) return "";
    if (n < 20) return ones[n];
    if (n < 100) {
      const t = Math.floor(n / 10);
      const r = n % 10;
      return r ? `${tens[t]} ${ones[r]}` : tens[t];
    }
    if (n < 1000) {
      const h = Math.floor(n / 100);
      const r = n % 100;
      return r ? `${ones[h]} hundred ${numToWords(r)}` : `${ones[h]} hundred`;
    }
    if (n < 1000000) {
      const th = Math.floor(n / 1000);
      const r = n % 1000;
      return r
        ? `${numToWords(th)} thousand ${numToWords(r)}`
        : `${numToWords(th)} thousand`;
    }
    return n.toString();
  }

  function ordinalSuffix(n) {
    n = Number(n);
    if (Number.isNaN(n)) return "th";
    if (n % 100 >= 11 && n % 100 <= 13) return "th";
    switch (n % 10) {
      case 1:
        return "first";
      case 2:
        return "second";
      case 3:
        return "third";
      default:
        return "th";
    }
  }

  function yearToWords(y) {
    y = Number(y);
    if (Number.isNaN(y)) return "";
    if (y >= 1100 && y <= 2099) {
      const first = Math.floor(y / 100);
      const last = y % 100;
      return last === 0
        ? `${numToWords(first)} hundred`
        : `${numToWords(first)} ${numToWords(last)}`;
    }
    return numToWords(y);
  }

  let normalized = text;
  normalized = normalized.replace(/\b(1[1-9]\d{2}|20\d{2})\b/g, (m) =>
    yearToWords(m),
  );
  normalized = normalized.replace(
    /\b(\d+)(st|nd|rd|th)\b/g,
    (_, n) => `${numToWords(n)} ${ordinalSuffix(n)}`,
  );
  normalized = normalized.replace(
    /\b(\d+)%\b/g,
    (_, n) => `${numToWords(n)} percent`,
  );
  normalized = normalized.replace(/\$(\d+)(?:\.(\d+))?/g, (_, d, c) =>
    c
      ? `${numToWords(d)} dollars and ${numToWords(c)} cents`
      : `${numToWords(d)} dollars`,
  );
  normalized = normalized.replace(/\b\d+\.\d+\b/g, (m) =>
    m.split(".").map(numToWords).join(" point "),
  );
  normalized = normalized.replace(/\b\d+\b/g, (m) => numToWords(m));
  return normalized;
}

function chunkForTTS(text, maxLen = 180) {
  const normalized = String(text || "").trim();
  if (!normalized) return [];
  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [normalized];
  const chunks = [];
  let buffer = "";

  for (const sentence of sentences) {
    if ((buffer + sentence).length <= maxLen) {
      buffer += sentence;
    } else {
      if (buffer) {
        chunks.push(buffer.trim());
      }
      if (sentence.length > maxLen) {
        for (let i = 0; i < sentence.length; i += maxLen) {
          chunks.push(sentence.slice(i, i + maxLen).trim());
        }
        buffer = "";
      } else {
        buffer = sentence;
      }
    }
  }

  if (buffer) {
    chunks.push(buffer.trim());
  }

  return chunks.filter(Boolean);
}

export { preprocessForTTS, chunkForTTS };

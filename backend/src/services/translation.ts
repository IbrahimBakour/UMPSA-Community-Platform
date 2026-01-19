import { translate } from "google-translate-api-x";
import crypto from "crypto";

type TargetLang = "ms" | "en";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function hashContent(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

// In-memory cache: key = target + ":" + hash
const cache = new Map<string, string>();

export async function warmupTranslation(): Promise<void> {
  // No warmup needed for google-translate-api (HTTP-based)
  console.log("Translation service ready (google-translate-api)");
}

function getTargetLanguageCode(target: TargetLang): string {
  return target === "ms" ? "ms" : "en";
}

function splitPreservingUrls(text: string): string[] {
  // Split into parts where URLs are separate tokens
  return text.split(URL_REGEX);
}

function isUrl(part: string): boolean {
  return URL_REGEX.test(part);
}

export async function translateTextRaw(
  text: string,
  target: TargetLang,
): Promise<string> {
  const MAX_LEN = Number(process.env.TRANSLATION_MAX_INPUT || 10000);
  const input = text.slice(0, MAX_LEN);
  const key = `${target}:${hashContent(input)}`;

  const cached = cache.get(key);
  if (cached) {
    console.log(`Translation cache hit for ${target}`);
    return cached;
  }

  console.log(`Translating to ${target}... (length: ${input.length})`);

  const targetLangCode = getTargetLanguageCode(target);
  const parts = splitPreservingUrls(input);
  const translatedParts: string[] = [];

  for (const part of parts) {
    if (!part) {
      translatedParts.push("");
      continue;
    }
    if (isUrl(part)) {
      translatedParts.push(part);
      continue;
    }
    // Preserve whitespace-only segments without translation
    if (/^\s+$/.test(part)) {
      translatedParts.push(part);
      continue;
    }
    // Call Google Translate for non-URL content segments
    try {
      const result = await translate(part, { to: targetLangCode });
      translatedParts.push(result.text ?? part);
    } catch (e) {
      console.error(`Translation error for segment "${part}":`, e);
      // Fallback: push original part if translation fails
      translatedParts.push(part);
    }
  }

  const finalText = translatedParts.join("");
  cache.set(key, finalText);
  console.log(`Translation complete for ${target}`);
  return finalText;
}

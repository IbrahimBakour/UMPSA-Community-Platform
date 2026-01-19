import api from "./api";

export type TargetLang = "ms" | "en";

export async function translateText(
  text: string,
  target: TargetLang,
): Promise<string> {
  const { data } = await api.post("/api/translate/text", { text, target });
  return data.translatedText as string;
}

export async function translatePost(
  postId: string,
  target: TargetLang,
): Promise<string> {
  const { data } = await api.get(`/api/translate/posts/${postId}`, {
    params: { target },
  });
  return data.translatedText as string;
}

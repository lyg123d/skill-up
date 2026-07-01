export async function generateSpeechWithExternalTTS(text: string) {
  const endpoint = process.env.LOCAL_TTS_API_URL?.trim();
  if (!endpoint) {
    throw new Error("LOCAL_TTS_API_URL이 설정되지 않았습니다.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    const detail = await readTtsError(response);
    throw new Error(detail || `외부 TTS API 호출 실패: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("audio/")) {
    throw new Error(`외부 TTS API가 오디오가 아닌 응답을 반환했습니다: ${contentType || "unknown"}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function readTtsError(response: Response) {
  const text = await response.text();
  if (!text) return "";

  try {
    const payload = JSON.parse(text) as { detail?: string; error?: string; message?: string };
    return payload.detail || payload.error || payload.message || text;
  } catch {
    return text;
  }
}

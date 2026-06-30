import { NextResponse } from "next/server";
import type { GenerateVoiceRequest, GenerateVoiceResponse, GeneratedVoiceSegment } from "@/types/news";
import { generateSpeechWithOpenAI } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateVoiceRequest;
    if (body.scenes?.length) {
      const segments: GeneratedVoiceSegment[] = [];

      for (const scene of body.scenes) {
        try {
          const audio_url = await generateSpeechWithOpenAI(scene.narration || scene.subtitle, body.voice);
          segments.push({ scene_number: scene.scene_number, audio_url, status: "success" });
        } catch (error) {
          segments.push({
            scene_number: scene.scene_number,
            status: "failed",
            error: error instanceof Error ? error.message : "씬 음성 생성에 실패했습니다."
          });
        }
      }

      const firstAudio = segments.find((segment) => segment.status === "success" && segment.audio_url)?.audio_url;
      const failedCount = segments.filter((segment) => segment.status === "failed").length;
      const firstError = segments.find((segment) => segment.error)?.error;
      const response: GenerateVoiceResponse = {
        audio: {
          audio_url: firstAudio,
          segments,
          status: firstAudio ? "success" : "failed",
          error: failedCount
            ? firstAudio
              ? `${failedCount}개 씬의 음성 생성에 실패했습니다. 성공한 씬 음성만 영상에 포함됩니다.`
              : firstError || "모든 씬의 음성 생성에 실패했습니다."
            : undefined
        }
      };
      return NextResponse.json(response);
    }

    try {
      const audio_url = await generateSpeechWithOpenAI(body.narration, body.voice);
      const response: GenerateVoiceResponse = { audio: { audio_url, status: "success" } };
      return NextResponse.json(response);
    } catch (error) {
      const response: GenerateVoiceResponse = {
        audio: {
          status: "failed",
          error: error instanceof Error ? error.message : "음성 생성에 실패했습니다."
        }
      };
      return NextResponse.json(response);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "음성 생성 요청에 실패했습니다." },
      { status: 500 }
    );
  }
}

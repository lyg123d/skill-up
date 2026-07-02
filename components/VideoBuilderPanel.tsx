import type { CaptionSettings, GeneratedSceneImage, GeneratedVideo, GeneratedVoice, NewsShortsScript } from "@/types/news";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type VideoBuilderPanelProps = {
  script?: NewsShortsScript;
  images: GeneratedSceneImage[];
  voice?: GeneratedVoice;
  video?: GeneratedVideo;
  captions: CaptionSettings;
  loadingImages: boolean;
  loadingVoice: boolean;
  loadingVideo: boolean;
  onGenerateImages: () => void;
  onGenerateVoice: () => void;
  onRenderVideo: () => void;
  onDownloadPackage: () => void;
  onChangeCaptions: (captions: CaptionSettings) => void;
};

export function VideoBuilderPanel({
  script,
  images,
  voice,
  video,
  captions,
  loadingImages,
  loadingVoice,
  loadingVideo,
  onGenerateImages,
  onGenerateVoice,
  onRenderVideo,
  onDownloadPackage,
  onChangeCaptions
}: VideoBuilderPanelProps) {
  const readyImageCount = images.filter((image) => image.status === "success" && image.image_url).length;
  const readyImages = Boolean(script?.scenes.length && readyImageCount >= script.scenes.length);
  const readyVoice = Boolean(voice?.status === "success" && voice.audio_url);
  const canRenderVideo = Boolean(script && readyImages);

  return (
    <section className="section">
      <div className="sectionHeader">
        <p className="eyebrow">Video Builder</p>
        <h2>이미지, 음성, 영상 패키지</h2>
      </div>
      <div className="builderGrid">
        <button type="button" onClick={onGenerateImages} disabled={!script || loadingImages}>
          {loadingImages ? <LoadingSpinner /> : null}
          씬별 이미지 생성
        </button>
        <button type="button" onClick={onGenerateVoice} disabled={!script || loadingVoice}>
          {loadingVoice ? <LoadingSpinner /> : null}
          내레이션 음성 생성
        </button>
        <button type="button" onClick={onRenderVideo} disabled={!canRenderVideo || loadingVideo}>
          {loadingVideo ? <LoadingSpinner /> : null}
          완성 영상 생성
        </button>
        <button type="button" onClick={onDownloadPackage} disabled={!script}>
          제작 패키지 다운로드
        </button>
      </div>
      <div className="statusGrid">
        <span>이미지 {readyImageCount}/{script?.scenes.length || 0}</span>
        <span>음성 {voice?.status || "대기"}</span>
        <span>영상 {video?.status || "대기"}</span>
        <label className="checkField">
          <input
            type="checkbox"
            checked={captions.enabled}
            onChange={(event) => onChangeCaptions({ enabled: event.target.checked })}
          />
          자막 번인 포함
        </label>
      </div>
      {script && !canRenderVideo ? (
        <p className="hint">완성 영상은 모든 씬 이미지가 준비된 뒤 생성할 수 있습니다. TTS가 실패하면 무음 영상으로 생성됩니다.</p>
      ) : null}
      {script && canRenderVideo && !readyVoice ? (
        <p className="hint">TTS 음성이 없어 무음 영상으로 생성됩니다. 음성이 필요하면 내레이션 음성 생성을 다시 시도하세요.</p>
      ) : null}
      {voice?.audio_url ? <audio controls src={voice.audio_url} /> : null}
      {video?.video_url ? (
        <div className="videoResult">
          <video controls src={video.video_url} />
          <a className="downloadLink" href={video.video_url} download={video.file_name || "news-shorts-video.webm"}>
            영상 다운로드
          </a>
          {video.size_bytes ? <span className="hint">{Math.round(video.size_bytes / 1024 / 1024)}MB · {video.mime_type}</span> : null}
        </div>
      ) : null}
      {video?.error ? <p className="hint">{video.error}</p> : null}
    </section>
  );
}

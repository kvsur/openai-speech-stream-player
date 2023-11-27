interface Options {
  onPlaying?: () => void;
  onPause?: () => void;
  onChunkEnd?: () => void;
  mimeType?: string;
  audio?: HTMLAudioElement;
}
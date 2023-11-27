/**
 * @typedef {{ 
 *  onPlaying?: () => void; 
 *  onPause?: () => void; 
 *  onChunkEnd?: () => void; 
 *  mimeType?: string; 
 *  audio?: HTMLAudioElement 
 * }} Options
 */
class SpeechPlayer {
  /** @type { HTMLAudioElement } */
  _audio: HTMLAudioElement;
  /** @type { MediaSource } */
  mediaSource: MediaSource;
  /** @type { SourceBuffer } */
  sourceBuffer: SourceBuffer;
  /** @type {() => void } */
  initResolve: ((value: unknown) => void) | null;
  /** @type {ArrayBuffer[]} */
  sourceBufferCache: ArrayBuffer[] = [];
  /** @type {boolean} */
  destroyed: boolean = false;
  /** @type {boolean} */
  mediaSourceOpened: boolean = false;
  /** @type {Options} */
  options: Options = {};

  get audio() {
    return this._audio;
  }

  set audio(audio) {
    this._audio = audio;
  }

  /**
   * @param { HTMLAudioElement } customAudioEl 
   * @param { Options } options
   */
  constructor(options?: Options) {
    if (options) {
      this.audio = options.audio;
    } 
    this.options = options || {};
  }

  static async *streamAsyncIterable(stream: ReadableStream) {
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          return;
        }
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.destroyed = false;
      this.mediaSource = new MediaSource();
      this.audio = this.audio || new Audio();
      this.audio.src = URL.createObjectURL(this.mediaSource);
      this.initResolve = resolve;
      this.mediaSource.addEventListener('sourceopen', this.sourceOpenHandle.bind(this));
    });
  }

  sourceOpenHandle() {
    if (this.initResolve) {
      this.initResolve('');
      this.initResolve = null;
      URL.revokeObjectURL(this.audio.src);

      this.sourceBuffer = this.mediaSource.addSourceBuffer(this.options?.mimeType ?? 'audio/mpeg');
      let timer = 0;
      this.audio.addEventListener('playing', () => {
        this.options.onPlaying && this.options.onPlaying();
      });
      this.audio.addEventListener('pause', () => {
        this.options.onPause && this.options.onPause();
      });
      this.sourceBuffer.addEventListener('updateend', () => {
        timer && clearTimeout(timer);
        this.audio.paused && this.audio.play();
        (!this.sourceBuffer.updating
          && this.sourceBufferCache.length)
          && this.sourceBuffer.appendBuffer(this.sourceBufferCache.shift() as ArrayBuffer);
      });
      this.audio.addEventListener('waiting', () => {
        timer = setTimeout(() => {
          if (!this.sourceBuffer.updating
            && this.mediaSource.readyState === 'open'
            && this.sourceBufferCache.length === 0) {
            this.mediaSource.endOfStream();
            this.options.onChunkEnd && this.options.onChunkEnd();
          }
        }, 100);
      });
      this.mediaSourceOpened = true;
    }
  }

  /**
   * Feed audio chunk data into player with SourceBuffer created from MediaSource
   * @param {Uint8Array} chunk 
   */
  feed(chunk: Uint8Array) {
    if (this.destroyed) throw new ReferenceError('SpeechPlayer has been destroyed.');
    if (!this.mediaSourceOpened) throw new Error('MediaSource not opened, please do this update init resolved.');
    this.sourceBufferCache.push(chunk);
    !this.sourceBuffer.updating && this.sourceBuffer.appendBuffer(this.sourceBufferCache.shift() as ArrayBuffer);
  }

  /**
   * Feed audio chunk just with Fetch response and deal automaticlly.
   * @param {Response} response 
   */
  async feedWithResponse(response: Response) {
    for await (const chunk of SpeechPlayer.streamAsyncIterable(response.body)) {
      this.feed(chunk);
    }
  }

  play() {
    this.audio && this.audio.paused && this.audio.play();
  }

  pause() {
    this.audio && !this.audio.paused && this.audio.play();
  }

  get paused() {
    return this.audio && this.audio.paused;
  }

  get playing() {
    return !this.paused;
  }

  /**
   * Destroy speechPlayer instance, if want play again, need do init method again.
   */
  destroy() {
    if (this.audio && this.audio.paused === false) this.audio.pause();
    this.destroyed = true;
    this.mediaSourceOpened = false;
    this.mediaSource && this.mediaSource.removeSourceBuffer(this.sourceBuffer as SourceBuffer);
    this.mediaSource && this.mediaSource.endOfStream();
    this.sourceBuffer.abort();
    this.sourceBufferCache.splice(0);
  }
}

export { SpeechPlayer };

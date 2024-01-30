interface Options {
    onPlaying?: () => void;
    onPause?: () => void;
    onChunkEnd?: () => void;
    mimeType?: string;
    audio?: HTMLAudioElement;
}
/**
 * @typedef {{
 *  onPlaying?: () => void;
 *  onPause?: () => void;
 *  onChunkEnd?: () => void;
 *  mimeType?: string;
 *  audio?: HTMLAudioElement
 * }} Options
 */
declare class SpeechPlayer {
    /** @type { HTMLAudioElement } */
    _audio: HTMLAudioElement;
    /** @type { MediaSource } */
    mediaSource: MediaSource;
    /** @type { SourceBuffer } */
    sourceBuffer: SourceBuffer;
    /** @type {() => void } */
    initResolve: ((value: unknown) => void) | null;
    /** @type {ArrayBuffer[]} */
    sourceBufferCache: ArrayBuffer[];
    /** @type {boolean} */
    destroyed: boolean;
    /** @type {boolean} */
    mediaSourceOpened: boolean;
    /** @type {Options} */
    options: Options;
    get audio(): HTMLAudioElement;
    set audio(audio: HTMLAudioElement);
    /**
     * @param { Options } options
     */
    constructor(options?: Options);
    static streamAsyncIterable(stream: ReadableStream<Uint8Array>): AsyncGenerator<Uint8Array, void, unknown>;
    init(): Promise<unknown>;
    sourceOpenHandle(): void;
    /**
     * Feed audio chunk data into player with SourceBuffer created from MediaSource
     * @param {Uint8Array} chunk
     */
    feed(chunk: Uint8Array): void;
    /**
     * Feed audio chunk just with Fetch response and deal automaticlly.
     * @param {Response} response
     */
    feedWithResponse(response: Response): Promise<void>;
    play(): Promise<boolean>;
    pause(): Promise<boolean>;
    get paused(): boolean;
    get playing(): boolean;
    /**
     * Destroy speechPlayer instance, if want play again, need do init method again.
     */
    destroy(): void;
}
export { SpeechPlayer };

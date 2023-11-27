/**
 * @typedef {{ onPlaying?: () => void; onPause?: () => void; onChunkEnd?: () => void; mimeType?: string }} Options
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
     * @param { HTMLAudioElement } customAudioEl
     * @param { Options } options
     */
    constructor(customAudioEl: HTMLAudioElement, options?: Options);
    static streamAsyncIterable(stream: any): AsyncGenerator<any, void, unknown>;
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
    play(): void;
    pause(): void;
    get paused(): boolean;
    get playing(): boolean;
    /**
     * Destroy speechPlayer instance, if want play again, need do init method again.
     */
    destroy(): void;
}
export { SpeechPlayer };

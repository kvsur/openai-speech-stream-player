"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechPlayer = void 0;
/**
 * @typedef {{ onPlaying?: () => void; onPause?: () => void; onChunkEnd?: () => void; mimeType?: string }} Options
 */
class SpeechPlayer {
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
    constructor(customAudioEl, options = {}) {
        /** @type {ArrayBuffer[]} */
        this.sourceBufferCache = [];
        /** @type {boolean} */
        this.destroyed = false;
        /** @type {boolean} */
        this.mediaSourceOpened = false;
        /** @type {Options} */
        this.options = {};
        if (customAudioEl) {
            this.audio = customAudioEl;
            this.options = options || {};
        }
    }
    static async *streamAsyncIterable(stream) {
        const reader = stream.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    return;
                }
                yield value;
            }
        }
        finally {
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
        var _a, _b;
        if (this.initResolve) {
            this.initResolve('');
            this.initResolve = null;
            URL.revokeObjectURL(this.audio.src);
            this.sourceBuffer = this.mediaSource.addSourceBuffer((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.mimeType) !== null && _b !== void 0 ? _b : 'audio/mpeg');
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
                    && this.sourceBuffer.appendBuffer(this.sourceBufferCache.shift());
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
    feed(chunk) {
        if (this.destroyed)
            throw new ReferenceError('SpeechPlayer has been destroyed.');
        if (!this.mediaSourceOpened)
            throw new Error('MediaSource not opened, please do this update init resolved.');
        this.sourceBufferCache.push(chunk);
        !this.sourceBuffer.updating && this.sourceBuffer.appendBuffer(this.sourceBufferCache.shift());
    }
    /**
     * Feed audio chunk just with Fetch response and deal automaticlly.
     * @param {Response} response
     */
    async feedWithResponse(response) {
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
        if (this.audio && this.audio.paused === false)
            this.audio.pause();
        this.destroyed = true;
        this.mediaSourceOpened = false;
        this.mediaSource && this.mediaSource.removeSourceBuffer(this.sourceBuffer);
        this.mediaSource && this.mediaSource.endOfStream();
        this.sourceBuffer.abort();
        this.sourceBufferCache.splice(0);
    }
}
exports.SpeechPlayer = SpeechPlayer;
//# sourceMappingURL=Player.js.map
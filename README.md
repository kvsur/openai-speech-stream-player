# openai-speech-stream-player
It's a player for play SSE streaming chunk from OpenAI audio speech API.


### Usage

```typescript
import { SpeechPlayer } from 'openai-speech-stream-player';

async function main() {
  const audioEl = document.querySelector('audio');
  const player = new SpeechPlayer({
    audio: audioEl,
    onPlaying: () => {},
    onPause: () => {},
    onChunkEnd: () => {},
    mimeType: 'audio/mpeg',
  });
  await player.init();

  var myHeaders = new Headers();
  myHeaders.append("Cache-Control", "no-store");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", "Bearer yourKeyHere");

  var raw = JSON.stringify({
    "model": "tts-1",
    "input": "Hi, What's your name?",
    "voice": "shimmer",
    "response_format": "mp3",
    "speed": 1
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  const response = await fetch("https://api.openai.com/v1/audio/speech", requestOptions);
  player.feedWithResponse(response);
}

main();

```

Or you can DIY with response DIY

```typescript
async function* streamAsyncIterable(stream) {
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

async function main() {
  // ...
  const response = await fetch("https://api.openai.com/v1/audio/speech", requestOptions);

  for await (const chunk of streamAsyncIterable(response.body)) {
    player.feed(chunk);
  }
}

```
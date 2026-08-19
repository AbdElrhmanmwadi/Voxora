# Prompt: Voice endpoints — frontend integration

> Copy everything below this line and give it to the frontend developer / AI agent.

---

The backend exposes three voice endpoints, all requiring `Authorization: Bearer <token>`:

- `POST /api/v1/voice/stt` — audio file → transcript text
- `POST /api/v1/voice/tts` — JSON `{text}` → `audio/wav`
- `POST /api/v1/voice/chat/{project_id}` — spoken question → STT → RAG answer → spoken answer

`/voice/chat` now supports **streaming** (token-by-token text + sentence-by-sentence
audio) via a `stream` flag. Both modes are documented below.

## Breaking changes to apply if you already call these endpoints

1. **`/stt` and `/tts` now require the bearer token** — without it they return `401`.
   With `FormData`, do **not** set `Content-Type` manually (the browser sets it).
2. **`/voice/chat` JSON response dropped `full_prompt` and `chat_history`** — if you
   read them, they're now `undefined`. Remaining fields: `transcript`, `answer`,
   `audio_base64`, `audio_mime_type`.
3. **Unknown project → `404`** (no silent creation).
4. **New upload errors**: `400 file_type_not_supported`, `413 file_size_exceeded`.
5. **`X-Transcript` header** (raw-audio mode only) is percent-encoded:
   `decodeURIComponent(res.headers.get("X-Transcript"))`.

## `/voice/chat` — non-streaming (default, `stream` omitted/false)

`multipart/form-data`: `audio` (file), `limit` (int, default 30),
`return_audio_base64` (bool, default true), optional `?language=ar`.

`200` (with `return_audio_base64=true`):
```json
{
  "signal": "voice_chat_success",
  "transcript": "what the user said",
  "answer": "the assistant's answer",
  "audio_base64": "<wav>",
  "audio_mime_type": "audio/wav"
}
```
With `return_audio_base64=false`: raw `audio/wav` body, transcript in the
percent-encoded `X-Transcript` header.

## `/voice/chat` — streaming (`stream=true`)

Add `stream: "true"` to the form. The response is `text/event-stream` (SSE).
Instead of waiting ~10s of silence, the client gets the reply in waves:

```
transcript (once) → delta* (answer text) → audio* (one wav per sentence) → done
```

### Events

| event        | when                       | data | what to do |
|--------------|----------------------------|------|------------|
| `transcript` | once, after STT            | `{"text": "..."}` | show what was heard |
| `delta`      | per answer text chunk      | `{"text": "..."}` | append to the answer bubble (types out live) |
| `audio`      | per spoken sentence        | `{"audio_base64": "<wav>", "mime_type": "audio/wav", "seq": <int>}` | **queue and play in `seq` order** |
| `done`       | once, at the end           | `{"answer": "<full text>", "signal": "voice_chat_success"}` | mark complete; `answer` is the full text |
| `error`      | on mid-stream failure      | `{"detail": "..."}` then closes | show an error |

Notes:
- Concatenated `delta` text == `done.answer`.
- `audio` clips arrive sentence-by-sentence; **play them sequentially by `seq`**
  so the spoken answer flows naturally (don't play overlapping).
- Auth/project/upload errors (401/404/400/413) still arrive as plain JSON
  **before** the stream starts — check `res.ok` and content-type first.

### Key difference from the agent text streaming

Agent chat streams `meta → delta → done` (text only). Voice chat adds
`transcript` up front and `audio` clips throughout — so the client needs an
**audio playback queue**, which text streaming did not.

## Example — streaming voice chat with sequential audio playback

```ts
async function voiceChatStream(projectId: number, audioBlob: Blob, token: string) {
  const form = new FormData();
  form.append("audio", audioBlob, "question.webm");
  form.append("stream", "true");
  form.append("limit", "5");

  const res = await fetch(`${API}/api/v1/voice/chat/${projectId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }, // no Content-Type for FormData
    body: form,
  });

  if (!res.ok || !(res.headers.get("content-type") ?? "").includes("text/event-stream")) {
    const err = await res.json().catch(() => null);   // 401 / 404 / 400 / 413
    throw new Error(err?.message ?? `HTTP ${res.status}`);
  }

  // --- sequential audio playback queue ---
  const queue: { seq: number; src: string }[] = [];
  let playing = false;
  function enqueue(clip: { seq: number; src: string }) {
    queue.push(clip);
    queue.sort((a, b) => a.seq - b.seq);
    if (!playing) playNext();
  }
  function playNext() {
    const next = queue.shift();
    if (!next) { playing = false; return; }
    playing = true;
    const audio = new Audio(next.src);
    audio.onended = playNext;
    audio.play();
  }

  // --- parse SSE ---
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      let event = "", data = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("event: ")) event = line.slice(7);
        else if (line.startsWith("data: ")) data = line.slice(6);
      }
      if (!data) continue;
      const payload = JSON.parse(data);
      if (event === "transcript") showUserText(payload.text);
      else if (event === "delta") appendAnswer(payload.text);
      else if (event === "audio") enqueue({ seq: payload.seq, src: `data:${payload.mime_type};base64,${payload.audio_base64}` });
      else if (event === "done") markComplete(payload.answer);
      else if (event === "error") showError(payload.detail);
    }
  }
}
```

## UI requirements

1. Show the answer text live as `delta`s arrive (typing effect).
2. Queue `audio` clips and play them in `seq` order — never overlapping.
3. On `error`: keep visible text, mark the message failed. The backend persists
   nothing for voice, so retrying re-sends the same audio.
4. Wire an `AbortController` to the fetch so closing/stopping cancels the stream
   (the server cleans up on disconnect).
5. Accepted audio upload types: `.wav .mp3 .m4a .mp4 .ogg .oga .webm .flac .aac
   .opus .wma .amr .3gp`. Validate client-side too.

## Verify

```bash
# non-stream (unchanged JSON):
curl -X POST "$API/api/v1/voice/chat/1000" -H "Authorization: Bearer $T" \
  -F audio=@question.wav -F limit=5

# stream (-N disables curl buffering):
curl -N -X POST "$API/api/v1/voice/chat/1000" -H "Authorization: Bearer $T" \
  -F audio=@question.wav -F stream=true -F limit=5
# → event: transcript, then event: delta ..., event: audio ..., event: done
```

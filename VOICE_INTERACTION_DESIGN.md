# Technical Design: Voice Interaction System for Video Streaming Platform

## 1. Voice Search (Speech-to-Text)

### 1.1 State-of-the-Art Approaches

| Approach | Description | Pros | Cons | Top Contenders |
| :--- | :--- | :--- | :--- | :--- |
| **Browser-Native (Web Speech API)** | Uses the browser's built-in `SpeechRecognition` interface. | • Zero cost<br>• No external dependencies<br>• Low latency (usually) | • Inconsistent support (Firefox/Safari limitations)<br>• Privacy concerns (data often sent to browser vendor)<br>• Limited customization | Chrome Web Speech API |
| **Cloud-Based APIs** | Audio streamed to a managed cloud service for transcription. | • High accuracy<br>• Extensive language support<br>• Speaker diarization & punctuation | • Recurring costs<br>• Latency (network dependent)<br>• Privacy/Compliance overhead | OpenAI Whisper API, Google Cloud STT, AWS Transcribe, Azure Speech |
| **Locally Hosted (WASM/Client-Side)** | Running optimized models (e.g., Whisper) directly in the browser using WebAssembly. | • Ultimate privacy (data stays on device)<br>• Zero server cost<br>• Offline capability | • High initial download size (models)<br>• High client CPU/RAM usage<br>• Battery drain on mobile | Transformers.js (Whisper), Vosk-browser, TensorFlow.js |

### 1.2 Decision Framework

| Factor | Recommendation | Rationale |
| :--- | :--- | :--- |
| **MVP / Low Budget** | **Browser-Native** | Fastest to implement, free, sufficient for basic search queries. |
| **Production / High Accuracy** | **Cloud-Based (OpenAI Whisper)** | Best-in-class accuracy, handles accents/noise well, critical for search relevance. |
| **Privacy-First / Offline** | **Locally Hosted (Transformers.js)** | If user trust is paramount or offline usage is a key feature. |
| **Latency Critical** | **Hybrid** | Use Browser-Native for immediate feedback, fallback to Cloud for complex queries. |

### 1.3 End-to-End Architecture

**Flow:** `Microphone -> AudioContext -> VAD -> Stream/Batch -> STT Engine -> Normalization -> Search API`

1.  **Real-time Audio Capture**:
    *   Use `navigator.mediaDevices.getUserMedia`.
    *   **AudioWorklet** for non-blocking processing on the main thread.
2.  **Pre-processing**:
    *   **VAD (Voice Activity Detection)**: Use a lightweight library (e.g., `hark.js` or `ricky0123/vad-react`) to detect speech start/end.
    *   **Noise Suppression**: Web Audio API filters (High-pass/Low-pass) to remove background hum.
3.  **Permission Handling**:
    *   Request permission *only* when the user clicks the mic icon.
    *   Handle `NotAllowedError` and `NotFoundError` gracefully with UI prompts.
4.  **Streaming vs Batch**:
    *   **Search**: **Batch** is usually sufficient. Record -> Stop on Silence -> Send to API.
    *   **Dictation**: **Streaming** (WebSockets) for real-time text feedback.
5.  **Post-Processing**:
    *   **Normalization**: Lowercase, remove punctuation (unless semantic), convert numbers to digits.
    *   **Intent Detection**: (Optional for search) Classify if query is navigational ("Go to settings") vs content ("Funny cat videos").

### 1.4 Backend Search Integration

**Stack**: Node.js + Elasticsearch / MongoDB Atlas Search

1.  **Query Expansion**:
    *   Receive transcribed text: "funny cats".
    *   Expand synonyms: "funny cats", "kittens", "humorous felines".
2.  **Semantic Search (Vector Embeddings)**:
    *   Generate vector embedding for the query using a model like `all-MiniLM-L6-v2`.
    *   Search vector index in DB for semantically similar video titles/descriptions.
3.  **Typo Correction (Fuzzy Search)**:
    *   Use Levenshtein distance (Fuzziness level 1 or 2) in Elasticsearch to handle slight transcription errors.
4.  **Feedback Loop**:
    *   "Did you mean...?" suggestions if confidence is low.

### 1.5 User Journey & Accessibility

*   **Journey**:
    1.  User clicks "Mic" icon in search bar.
    2.  Sound cue (beep) indicates listening.
    3.  Visualizer (waveform) reacts to voice volume.
    4.  User speaks "React JS tutorials".
    5.  Silence detected (1.5s) -> Auto-stop.
    6.  Text appears in search bar -> Auto-submit.
*   **Accessibility**:
    *   **ARIA**: `role="button"`, `aria-label="Voice Search"`, `aria-pressed="true/false"`.
    *   **Feedback**: Audio cues for Start/Stop/Error.
    *   **Multilingual**: Auto-detect language or allow user preference toggle.

---

## 2. In-Video Voice Commands (Speech Control)

### 2.1 Keyword Spotting vs NLU

*   **Keyword Spotting (KWS)**:
    *   **Mechanism**: Detects specific "wake words" or short commands (e.g., "Play", "Pause", "Volume Up").
    *   **Pros**: Extremely fast, runs locally, privacy-friendly, low compute.
    *   **Use Case**: Immediate player controls.
*   **Natural Language Understanding (NLU)**:
    *   **Mechanism**: Parses complex sentences ("Skip to the part where he talks about Redux").
    *   **Pros**: Flexible, powerful.
    *   **Cons**: Slower, usually requires cloud processing.
    *   **Use Case**: Content navigation, complex search within video.

### 2.2 Model Options

| Option | Type | Best For | Recommendation |
| :--- | :--- | :--- | :--- |
| **TensorFlow.js (Speech Commands)** | Local / Browser | Basic commands (Stop, Go, Up, Down). Pre-trained models available. | **High** (for MVP) |
| **Picovoice Porcupine** | Local / WASM | Wake word detection (High accuracy). | **Medium** (Paid license) |
| **Browser Speech API** | Browser | General dictation, can parse commands via regex. | **Low** (Too slow for controls) |

### 2.3 System Architecture

**Flow:** `Audio Stream -> Wake Word/Command Detector -> Intent Parser -> Player Action -> Feedback`

1.  **Audio Input**: Continuous listening (requires "Wake Word" or "Push-to-Talk" to avoid accidental triggers).
    *   *Recommendation*: **Push-to-Talk** (hold spacebar or click mic) is better for web UX than always-on listening.
2.  **Speech Recognition**:
    *   Use **TensorFlow.js** with the "Speech Commands" model.
    *   Map vocabulary: `['play', 'pause', 'stop', 'next', 'previous', 'mute', 'unmute']`.
3.  **Intent Parsing**:
    *   Map recognized word -> Player Function.
    *   `"pause"` -> `videoRef.current.pause()`.
    *   `"skip"` -> `videoRef.current.currentTime += 10`.
4.  **Context Resolution**:
    *   Ensure commands only trigger when the video player is in focus or active.
5.  **Confirmatory Feedback**:
    *   **Visual**: Toast notification "Paused" or icon overlay.
    *   **Audio**: Subtle click sound.

### 2.4 Advanced Features

*   **Contextual Awareness**:
    *   "Skip intro" -> Checks if video has intro timestamps (e.g., from YouTube API or internal metadata).
*   **Robust Error Handling**:
    *   If command is ambiguous ("Back"), ask or default to a safe action (Rewind 10s).
    *   Confidence threshold: Ignore commands with < 80% confidence.

### 2.5 User Stories & Flows

**Story 1: Hands-Free Cooking**
*   **User**: Watching a recipe video while chopping vegetables.
*   **Action**: User says "Hey App, Pause" (if wake word enabled) or taps a large "Listen" button and says "Pause".
*   **System**: Pauses video, shows large "PAUSED" icon.

**Story 2: Quick Navigation**
*   **User**: "Forward 30 seconds".
*   **System**: Parses "Forward" + "30", calculates new time, seeks.

### 2.6 UX & Accessibility

*   **Visual Indicators**:
    *   Microphone icon should pulse when processing.
    *   Command recognition should display the text detected briefly ("Recognized: Play").
*   **Error Recovery**:
    *   "I didn't catch that."
*   **Language Support**:
    *   Load specific TF.js model weights for different languages if needed.

---

## 3. Implementation Roadmap (MERN Stack)

### Phase 1: MVP (Voice Search)
1.  **Frontend**: Implement `useSpeechRecognition` hook using Web Speech API.
2.  **UI**: Add Mic button to `TopNavbar` search input.
3.  **Backend**: Ensure search API accepts text queries.

### Phase 2: In-Video Controls (Basic)
1.  **Frontend**: Integrate `tensorflow-models/speech-commands`.
2.  **Player**: Create a `VoiceControlOverlay` component for the video player.
3.  **Logic**: Map "Play", "Pause", "Mute" to video element refs.

### Phase 3: Advanced (Hybrid & NLU)
1.  **Search**: Switch to OpenAI Whisper API for better long-tail query accuracy.
2.  **Controls**: Add NLU for "Skip to [timestamp]" or "Search for [topic]" using a backend intent classifier.

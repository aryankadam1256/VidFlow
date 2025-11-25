# Implementation Plan: Voice Interaction Features

This plan outlines the steps to integrate Voice Search and In-Video Voice Commands into the existing MERN stack application.

## Phase 1: Voice Search (Frontend - TopNavbar)

**Goal**: Allow users to search for videos using their voice.

1.  **Dependencies & Setup**
    *   [ ] Install `react-speech-recognition` (or use native Web Speech API hook) for easier browser compatibility handling.
    *   [ ] Verify browser permissions for microphone usage.

2.  **UI Components**
    *   [ ] Modify `src/components/layout/TopNavbar.jsx`:
        *   Add a Microphone Icon button inside or next to the search input.
        *   Add a visual indicator (pulsing animation or color change) when listening.

3.  **Logic Implementation**
    *   [ ] Create a custom hook `useVoiceSearch` (or use library hook).
    *   [ ] Implement `startListening` and `stopListening` functions.
    *   [ ] Bind the transcript output to the Search Input state.
    *   [ ] Auto-submit the search query after a short pause in speech (silence detection).

4.  **UX Enhancements**
    *   [ ] Add a "Listening..." tooltip or toast.
    *   [ ] Handle errors (e.g., "Microphone not found" or "Permission denied").

## Phase 2: In-Video Voice Commands (Frontend - VideoPlayer)

**Goal**: Control video playback (Play, Pause, Mute) using voice commands.

1.  **Dependencies**
    *   [ ] Use `react-speech-recognition` (continuous listening mode) or `tensorflow-models/speech-commands` (if keyword spotting is preferred for performance). *Decision: Start with `react-speech-recognition` for simplicity and consistency with Phase 1.*

2.  **UI Components**
    *   [ ] Modify `src/pages/VideoDetail.jsx` (or the specific Player component):
        *   Add a "Voice Control" toggle switch (On/Off).
        *   Add a Feedback Overlay (e.g., shows "Paused" icon when command is recognized).

3.  **Command Logic**
    *   [ ] Define a command vocabulary:
        *   "Play" / "Start"
        *   "Pause" / "Stop"
        *   "Mute" / "Unmute"
        *   "Volume Up" / "Volume Down" (optional)
    *   [ ] Map commands to the `videoRef` methods (`.play()`, `.pause()`, etc.).
    *   [ ] Implement "Fuzzy Matching" to handle slight variations (e.g., "Pause video" vs "Pause").

4.  **Integration**
    *   [ ] Ensure voice commands *only* trigger when the user is on the Video Detail page and the toggle is active.

## Phase 3: Backend & Advanced (Future/Optional)

1.  **Search Optimization**
    *   [ ] (Backend) Ensure the search API handles natural language queries gracefully (e.g., stripping "show me" from "show me funny cats").
2.  **Custom Wake Word**
    *   [ ] Investigate Porcupine or TF.js for "Hey Tube" wake word activation.

---

## Execution Steps for Today

1.  **Step 1**: Install `react-speech-recognition` and `regenerator-runtime`.
2.  **Step 2**: Update `TopNavbar.jsx` to include the Voice Search feature.
3.  **Step 3**: Verify Voice Search functionality.
4.  **Step 4**: Update `VideoDetail.jsx` to include Voice Command listeners.
5.  **Step 5**: Test Video Controls.

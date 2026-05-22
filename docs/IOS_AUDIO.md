# iOS Safari Audio Notes

SpeakLoop uses browser microphone capture through `getUserMedia` and `MediaRecorder`.

- iOS Safari requires microphone capture to start from a clear user gesture, so the app never auto-prompts on page load.
- `MediaRecorder` support varies by iOS version. The recorder picks the first supported type from WebM, `audio/mp4`, then WAV.
- Audio playback should also be initiated from a user gesture on iOS Safari. The MVP renders native controls and applies playback speed through `audio.playbackRate`.
- If recording is unsupported, the UI shows a recovery/unsupported card instead of crashing.

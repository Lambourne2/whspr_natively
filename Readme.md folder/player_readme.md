# 🎧 Player Module

This folder contains all logic and components related to audio playback for the `Whspr Natively` sleep app.

The goal of this module is to:
- Provide reliable audio playback (e.g. ambient sounds, bedtime stories, etc.)
- Allow control over play/pause, volume, looping, and timers
- Integrate smoothly with the rest of the app’s UI/UX

---

## 🗂 Folder Contents

| File | Description |
|------|-------------|
| `AudioPlayer.js` | Core component responsible for loading and playing audio files. Handles playback state, errors, and audio session setup. |
| `AudioControls.js` | UI elements for user interaction—play/pause button, slider, volume control, etc. Connects to `AudioPlayer`. |
| `SleepTimer.js` | Optional sleep timer feature. Automatically stops playback after a set time. Useful for users falling asleep. |
| `useAudio.js` | A custom React Hook (if present) that manages the logic of playing/pausing audio, updating UI, and cleaning up resources. |
| `types.ts` or `types.js` | If present, defines shared types/interfaces for props and state used in the player. |

---

## 📲 How It Works

- When the user taps a sound, `AudioPlayer.js` initializes and plays it using the Expo Audio API (or a similar system).
- Playback state is managed locally and passed via context or props to controls.
- `AudioControls.js` provides user interaction and control.
- If `SleepTimer.js` is used, it sets a `setTimeout` or similar method to auto-stop playback.

---

## ⚠️ Potential Errors & Debug Notes

| Issue | Cause | Fix |
|-------|-------|-----|
| 🔇 No sound plays | Audio not properly loaded or permission denied | Check `loadAsync()` method and ensure permissions |
| 🌀 UI shows loading forever | Player state not updating | Verify state is properly managed and async events resolved |
| ⏱ Timer doesn't stop audio | State not tracked properly in `SleepTimer.js` | Ensure `clearTimeout()` and audio stop logic are linked |
| 🧠 Memory leak warning | Audio resources not unloaded | Confirm `unloadAsync()` is called on unmount or pause |

---

## 💡 Tips

- Modularize control and logic as separate components.
- Always include cleanup (stop/unload) logic in effects.
- When testing, use physical devices or emulators with audio permissions enabled.
- You can add logs using a centralized `logger.js` for tracking audio states.

---

## 🛠 Future Ideas

- Add fade-out effect when timer ends
- Let users pick custom audio from local storage
- Save playback position on app backgrounding

---

> **Note for Devs:** Feel free to leave comments in the code for future you/Peyton to clarify logic, especially in async/await sections or where audio lifecycle gets tricky.


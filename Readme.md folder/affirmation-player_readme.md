# 🎧 Affirmation Player (`/app/affirmation-player`)

This screen is responsible for **playing affirmations** — whether user-generated or AI-generated — with options to play, pause, loop, and switch between affirmations. It forms the core **audio playback experience** of Whspr Natively.

---

## 🧠 Purpose

To provide users with a calm and elegant interface where they can **listen to their affirmations**, control playback, and potentially loop or manage sessions for sleep or mindfulness.

---

## 🗂️ File Structure

| File | Description |
|------|-------------|
| `index.js` | The main entry point for the Affirmation Player screen. Controls audio logic, UI display, and navigation. |
| `audioUtils.js` *(if present)* | Handles Expo Audio playback, pausing, loading, and looping (if extracted). |

---

## 🔑 Key Features

- ⏯ **Play/Pause Functionality**
- 🔁 **Loop Toggle**
- 🧘🏽‍♀️ **Relaxed Theming** for a sleep-friendly environment
- 🎙️ **Text Display** of current affirmation
- ⏹️ Graceful handling of audio lifecycle (e.g., stop audio on navigation away)

---

## 🧩 Dependencies

- `expo-av` → for managing audio playback
- `expo-router` → navigation and screen routing
- `react-native` core components
- `Ionicons` / `Feather` / `MaterialIcons` for iconography
- `expo-linear-gradient` for UI styling
- `colors`, `buttonStyles`, and `commonStyles` for theme consistency

---

## 📜 How It Works

1. **Audio Setup**  
   On mount, the component loads a local or remote `.mp3` audio file using `Audio.Sound()` from Expo AV.

2. **User Controls**
   - Users can tap on a `TouchableOpacity` to play/pause the affirmation.
   - A loop toggle allows the affirmation to repeat, useful for meditation or sleep.
   - A back button allows the user to exit the screen safely, unloading the sound instance.

3. **UI Components**
   - Header with "Now Playing"
   - Affirmation text shown in calming font
   - A progress or status bar (optional depending on implementation)
   - Icons for playback controls at the bottom

---

## 🛠 Developer Notes

- Always ensure that `unloadAsync()` is called in `useEffect` cleanup to avoid memory leaks.
- If audio is sourced remotely, cache or pre-load content to reduce delay.
- Volume, pitch, and playback rate customization can be added for advanced features.
- Use `isMounted` flags or guards if state updates may occur after unmounting.

---

## ⚠️ Common Pitfalls

| Issue | Cause | Solution |
|-------|-------|----------|
| Audio continues after leaving screen | Sound not unloaded | Ensure `soundRef.current.unloadAsync()` is triggered in `useEffect` cleanup |
| Playback doesn’t start | File not loaded | Confirm audio file path or `loadAsync` success |
| App crash on back navigation | Sound object improperly handled | Use `try/catch` with `unloadAsync` and handle `null` sound refs gracefully |

---

## 🌟 Future Enhancements

- Add waveform or sound visualization
- Allow selection of background sounds (rain, ocean, etc.)
- Implement sleep timer to auto-stop playback after set duration
- Provide download/share/export options for affirmations
- Sync with meditation mode or integrate with iOS background audio

---

> **Dev Tip:** This is one of the most important emotional touchpoints in the app — ensure the experience is fluid, peaceful, and glitch-free for the user.


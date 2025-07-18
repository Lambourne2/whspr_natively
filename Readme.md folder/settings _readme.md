# ⚙️ Settings Screen (`Settings.tsx`)

This screen provides a user interface for configuring app preferences in **Whspr**, including audio behavior, theme, cache management, and tutorial access.

---

## 🧠 Purpose

The Settings screen allows users to:

- Customize **audio behavior** (loop gap, fade in/out)
- Toggle **app preferences** like theme and autoplay
- Clear temporary data with **Clear Cache**
- View the onboarding tutorial again
- Reset all settings to default

---

## 🧩 File Structure Overview

- `SettingsScreen`: Functional React Native component using `ScrollView`
- State managed via:
  - `useSettingsStore` – central settings state
  - `useAffirmationStore` – used to show local storage count
- Styled using:
  - `commonStyles` (shared layout)
  - `styles` (local component styles)
- Icons provided by: `Ionicons`
- Fonts from: `@expo-google-fonts/inter`

---

## 🖼️ UI Breakdown

| Section | Settings | Type |
|--------|----------|------|
| **Voice & Audio** | Loop Gap, Fade In/Out | Alert-based option pickers |
| **App Preferences** | Theme, Notifications, Autoplay | Toggle switches |
| **Data & Storage** | Local Cache | Read-only & Clear option |
| **Help & Support** | Reset, Re-onboard, App Version | Static/info |

---

## ⚠️ Dev Notes & Gotchas

- **Fonts**: Waits for `useFonts` before rendering to prevent layout flash
- **Router**: Uses `expo-router` navigation (`router.back()`, `router.push('/onboarding')`)
- **Modals**: Uses `Alert.alert` for simple native modal prompts (platform-safe)
- **State Hooks**: Persisted by custom Zustand stores in `/store/`

---

## 🛠️ Future Enhancements (Suggestions)

| Idea | Description |
|------|-------------|
| 🎨 Theme Preview | Add a live preview of dark/light theme toggle |
| 🔐 API Key Editor | Enable entry & encryption of personal API keys |
| 🧪 Settings Testing | Unit test individual toggle logic (using `__tests__/Settings.test.tsx`) |
| 🔄 AsyncStorage Sync | Add indicator if settings are syncing or unsaved |
| 🧹 Auto-clear Cache | Optional toggle to clear temp data weekly |

---

## 🧼 Reset & Cache Warnings

- `Clear Cache`: Deletes **temp audio files**, **preserves affirmations**
- `Reset Settings`: Restores defaults, **preserves affirmations & API keys**

Both actions confirm with destructive alerts.

---

## 🔄 Component Lifecycle

```plaintext
1. Load → Check if fonts are ready → If not, return null
2. On load → Pull `settings` & `affirmations` from stores
3. Render scrollable UI sections with prefilled user data
4. On toggle or press → Trigger `updateSettings` / Alert dialog logic

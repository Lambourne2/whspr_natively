# 🗂️ Root Layout (`/app/layout.js`)

This component serves as the **root layout wrapper** for the entire Whspr Natively app. It manages **safe area insets**, global **splash screen handling**, **navigation stack setup**, and **initial app state hydration** such as onboarding flow and backing tracks initialization.

---

## 🧠 Purpose

To provide a consistent, safe, and adaptive container for all screens, ensuring:

- Proper padding for device-specific safe areas (including emulation for web)
- Splash screen control to prevent UI flashes during app initialization
- Global error logging setup
- Initialization and hydration of essential app state (like audio backing tracks and settings)
- Conditional navigation to onboarding or main app screens

---

## 🗂️ File Structure

| File       | Description                                     |
|------------|------------------------------------------------|
| `layout.js` | Root layout component wrapping all app screens with SafeArea, StatusBar, and Stack Navigator |

---

## 🔑 Key Features

- 📱 **Safe Area Insets Handling**  
  Dynamically adjusts padding based on platform and device safe areas; supports web emulated device insets.

- 🛑 **Splash Screen Management**  
  Prevents splash screen auto-hide until app assets and state are ready.

- ⚙️ **Global Error Logging Setup**  
  Initializes error logging on app launch.

- 🎵 **Backing Tracks Initialization**  
  Loads available backing tracks from store and sets default track if none selected.

- 🔄 **Navigation Stack Setup**  
  Configures screens with animation and no headers by default.

- 🔀 **Onboarding Flow Control**  
  Redirects users to onboarding if not completed.

---

## 🧩 Dependencies

- `expo-router` → for screen routing and stack management
- `expo-status-bar` → for controlling status bar appearance
- `react-native-safe-area-context` → to handle device safe areas
- `react-native` core components → `SafeAreaView`, `Platform`
- `expo-splash-screen` → to control splash screen visibility
- App-specific stores: `settingsStore`, `affirmationStore`
- Utility: `errorLogger` for global error tracking
- Shared styles: `commonStyles`

---

## 📜 How It Works

1. **Splash Screen Handling**  
   Calls `SplashScreen.preventAutoHideAsync()` at the start, then hides the splash screen only after state is hydrated and ready.

2. **Safe Area Insets**  
   Uses `useSafeAreaInsets()` to get real device safe area insets, and if on web with an `emulate` param, overrides them with simulated values for specific devices.

3. **Global Initialization**  
   Sets up error logging, loads stored emulation device (if on web), initializes backing tracks in the store, and marks the store as hydrated.

4. **Conditional Navigation**  
   After hydration, checks onboarding completion and redirects to `/onboarding` if needed.

5. **Stack Navigator**  
   Wraps the entire app's screens inside a stack navigator, with default headers hidden and animations enabled.

---

## 🛠 Developer Notes

- Adjust simulated safe area insets as new devices or emulations are needed for web.
- Always call `SplashScreen.hideAsync()` after all async initializations to prevent UI flicker.
- Keep the onboarding redirection logic updated according to onboarding state.
- Use `SafeAreaView` with dynamic padding to avoid content clipping on devices with notches or home indicators.
- Consider expanding the stack with more screens as the app grows.

---

## ⚠️ Common Pitfalls

| Issue                         | Cause                                    | Solution                                      |
|-------------------------------|-----------------------------------------|-----------------------------------------------|
| Splash screen stays visible   | `hideAsync()` not called after init     | Ensure `SplashScreen.hideAsync()` is triggered post initialization |
| Content clipped by notch      | Incorrect or missing safe area insets   | Use `useSafeAreaInsets()` and apply padding properly |
| Onboarding screen never shows | Onboarding state not properly checked   | Verify `settings.hasCompletedOnboarding` logic |
| State not hydrated before render | Hydration logic missing or incomplete | Use state flags like `isReady` and hydrate stores fully before rendering |

---

## 🌟 Future Enhancements

- Support for dark mode status bar styling based on theme
- More granular screen transition animations
- Integrate analytics or crash reporting within error logging setup
- Add splash screen with custom branding or animation
- Introduce loading skeletons or placeholders during hydration

---

> **Dev Tip:** The root layout is foundational to the app’s UX and stability—keep initialization smooth and performant to ensure a polished user experience.

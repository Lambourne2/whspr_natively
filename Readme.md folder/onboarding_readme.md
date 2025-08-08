# 👋 Onboarding Module

This folder manages the user onboarding experience in the **Whspr Natively** app.

The onboarding flow is the user's first impression — it’s designed to guide new users through key app features, gather necessary permissions, and set up basic preferences.

---

## 🗂 Folder Contents

| File | Description |
|------|-------------|
| `IntroScreens.js` | Displays swipeable intro slides or a walkthrough carousel showcasing the app’s purpose (e.g., restful sleep, soothing sounds). |
| `PermissionsPrompt.js` | Requests necessary permissions (e.g., audio, notifications, background play). |
| `WelcomeScreen.js` | The very first screen users see—brand intro or tagline moment. |
| `UserSetup.js` | Optional step to collect user preferences (e.g., preferred sleep sounds, bedtime reminders). |
| `onboardingNavigator.js` | Handles screen-to-screen flow and transition logic for the onboarding steps. |
| `styles.js` | Shared styling for consistent visual presentation across onboarding screens. |

---

## 🎯 Purpose

- Introduce the app and its value clearly and quickly
- Capture any required permissions in a user-friendly way
- Let users personalize key app settings early
- Set the tone and brand experience from the start

---

## ⚙️ How It Works

- `onboardingNavigator.js` routes the user through `WelcomeScreen` → `IntroScreens` → `PermissionsPrompt` → `UserSetup`
- Completion of onboarding is stored in async storage or secure store, so it’s skipped on future app launches
- Smooth animations and friendly copy help create a positive first impression

---

## ⚠️ Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Onboarding shows on every app launch | Completion state not saved or retrieved | Check AsyncStorage/Redux and ensure `hasOnboarded` flag is respected |
| Permissions screen crashes | Platform-specific permission logic or missing Expo config | Use `Platform.OS` checks and review Expo permissions guide |
| Navigation skips or misfires | Improper use of `navigation.navigate()` | Ensure screen names match and `useNavigation()` hook is used properly |

---

## 💡 Tips for Customization

- Keep the onboarding flow short—3 to 5 screens max
- Use Lottie animations or soft transitions to increase polish
- Offer a “Skip” button that still captures default values and proceeds
- Make the copy and imagery feel calming and welcoming (on-brand!)

---

## 🚀 Future Improvements

- Dynamic onboarding based on user goals (e.g., stress relief vs. sleep aid)
- A/B test different onboarding flows to increase retention
- Integrate Firebase or Segment tracking for onboarding completion analytics

---

> **Dev Note:** Be mindful of first impressions. Keep things fast, smooth, and informative. Think of this as your app’s handshake — respectful, memorable, and clear.


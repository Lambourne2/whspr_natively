# 🏠 HomeScreen (`index.js`)

This is the **main entry screen** of the Whspr Natively app — a beautifully themed landing page that introduces users to the app's core experience and guides them to key features like creating affirmations, accessing the library, and exploring AI tools.

---

## 🧠 Purpose

The Home Screen is the visual and functional anchor of the app. It combines branding, calls-to-action, and navigational shortcuts to lead the user into deeper parts of the experience.

---

## 🗂️ Key Elements

| Section | Description |
|--------|-------------|
| **Header** | Displays the Whspr icon inside a gradient circle, app name ("Whspr"), and a short description (“Custom affirmations for peaceful sleep”). |
| **Quick Actions** | Primary buttons to navigate to:  
  - 🔹 `Create New Affirmation`  
  - 📚 `My Library`  
  - 🎵 `Sample Tracks` |
| **Feature Cards** | Two tappable cards for:  
  - ✨ `AI Generate` → Launch AI affirmation generator  
  - 🎙️ `Voice Settings` → Configure TTS or narrator voice |

---

## 🧩 Dependencies Used

- `react-native` core UI components (e.g., `ScrollView`, `TouchableOpacity`, `Image`)
- `expo-router` for navigation (`router.push`)
- `expo-linear-gradient` for stylish UI transitions
- `@expo/vector-icons` for consistent iconography (`Ionicons`)
- `@expo-google-fonts/inter` for modern, accessible typography
- Local shared styles: `commonStyles`, `colors`, `buttonStyles`
- Custom button component: `Button` (though currently unused in this screen)

---

## 🧬 How It Works

1. **Font Load Check**  
   Uses `useFonts()` to load Google Inter fonts before rendering the screen. If fonts aren’t loaded yet, returns `null`.

2. **Layout Structure**  
   - Gradient logo at the top
   - Text header and subheading
   - A scrollable section with tappable `TouchableOpacity` compone

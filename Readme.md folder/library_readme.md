# 🎶 Library Module

The `library` folder manages the core content experience of **Whspr Natively**, allowing users to browse, preview, and play sleep sounds, music, or audio sessions designed to improve rest, relaxation, and focus.

---

## 🗂 Folder Structure

| File | Description |
|------|-------------|
| `LibraryHome.js` | Main screen showing featured and categorized audio tracks (e.g., “Deep Sleep”, “Rain Sounds”, “Breathwork”). |
| `TrackCard.js` | Visual and interactive card component representing each audio track in the grid or list. |
| `TrackDetails.js` | Displays expanded information and controls for a selected track. May include play, pause, favorite, or download options. |
| `SearchLibrary.js` | Search bar and filtering interface for discovering specific content. |
| `CategoryTabs.js` | UI for navigating different content categories or moods. |
| `libraryUtils.js` | Utility functions to fetch and organize track data, format durations, or handle search. |
| `styles.js` | Styling used across the library components for consistent visuals. |

---

## 🎯 Purpose

- Showcase available audio content in an intuitive and calming interface
- Allow users to browse, search, and discover tracks easily
- Provide quick access to favorites and recently played items
- Maintain seamless integration with the playback experience

---

## 🔄 How It Works

- Data for tracks is loaded from the backend or local assets via `libraryUtils.js`
- `LibraryHome.js` uses `FlatList` or `ScrollView` to render audio cards (`TrackCard`)
- Selecting a track opens `TrackDetails.js`, where playback and additional info are shown
- `CategoryTabs` help users explore by mood, genre, or intent (e.g., "Sleep", "Focus", "Relax")

---

## 🧠 Features

- Fast loading and caching of cover images and metadata
- Responsive layout for tablets and phones
- Optional filters like duration, type, or rating
- Smooth animations when transitioning between library and player

---

## 🛠 Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Tracks don’t display | Missing or corrupted track data | Check fetch logic and placeholder fallbacks |
| UI feels cluttered | Too many tracks or inconsistent spacing | Review `styles.js` and consider paginating |
| Crashes on tap | Undefined props or bad navigation | Validate props and navigation targets using `PropTypes` or TS types |

---

## 💡 Tips for Success

- Use soft, dark mode-friendly colors to reduce screen brightness
- Optimize for offline mode (e.g., allow preloading tracks)
- Group content meaningfully by user goals (Sleep, Meditation, Nature)
- Integrate with a backend CMS for scalability

---

## 🚀 Future Ideas

- Add “Continue Listening” shelf using playback history
- Introduce sorting by popularity, duration, or user ratings
- Enable curated playlists or custom mixes
- Deep integration with AI for personalized content suggestions

---

> **Dev Note:** The library is the heart of the app. Make it feel like a sanctuary of sounds — calm, clean, and inviting.

# Whspr App - Manual Smoke Test Checklist

## Pre-Test Setup
- [ ] Ensure you have valid OpenRouter and ElevenLabs API keys
- [ ] Test on clean device/simulator (no previous app data)
- [ ] Verify internet connectivity

## Platform Testing
Test on all three platforms:
- [ ] Web (Chrome/Safari)
- [ ] iOS Simulator
- [ ] Android Emulator

---

## 1. Onboarding Flow
- [ ] App opens to onboarding screen on first launch
- [ ] Can navigate through all 5 onboarding slides
- [ ] Skip button works correctly
- [ ] Get Started button completes onboarding
- [ ] App redirects to home screen after onboarding
- [ ] Onboarding doesn't show again on subsequent launches

## 2. Home Screen
- [ ] Home screen loads without errors
- [ ] Whspr logo and title display correctly
- [ ] "Create New Affirmation" button is visible and functional
- [ ] "My Library" button is visible and functional
- [ ] Recent affirmations section shows (empty initially)
- [ ] Features section displays AI Generate and Voice Settings

## 3. Settings Configuration
- [ ] Settings screen opens from home
- [ ] Can enter OpenRouter API key
- [ ] Can enter ElevenLabs API key
- [ ] "Save & Test API Keys" button works
- [ ] API key validation provides feedback
- [ ] Can change default voice setting
- [ ] Can change default loop gap
- [ ] Theme toggle works (dark/light mode)
- [ ] All other settings are accessible and functional

## 4. Affirmation Creation (Full Wizard)
- [ ] "Create New Affirmation" opens the wizard
- [ ] Step 1: Can select an intent (sleep, confidence, etc.)
- [ ] Step 2: Can select a tone (soft, neutral, uplifting)
- [ ] Step 3: Can select a voice
- [ ] Step 4: Can set loop gap and optional custom title
- [ ] Step 5: Review screen shows all selections correctly
- [ ] "Generate Affirmations" button initiates creation
- [ ] Progress indicator shows during generation
- [ ] Success message appears when complete
- [ ] Can choose to "Play Now" or "Create Another"

## 5. AI Generate (Quick Creation)
- [ ] AI Generate screen opens from home
- [ ] Quick prompts are displayed and clickable
- [ ] Can select and generate from quick prompts
- [ ] Custom prompt text area works
- [ ] "Generate Custom Affirmations" button works
- [ ] Generation process completes successfully
- [ ] Tips section displays helpful information

## 6. Library Management
- [ ] Library screen shows generated affirmations
- [ ] Search functionality works
- [ ] Filter chips work (All, Sleep, Confidence, etc.)
- [ ] Sort options work (Recent, Oldest, Most Played, Title A-Z)
- [ ] Can tap affirmation to open player
- [ ] Can rename affirmations
- [ ] Can share affirmations
- [ ] Can delete affirmations with confirmation
- [ ] Empty state shows when no affirmations exist

## 7. Audio Player
- [ ] Player opens with selected affirmation
- [ ] Affirmation info displays correctly (title, metadata)
- [ ] Waveform visualization appears
- [ ] Play/pause button works
- [ ] Stop button works
- [ ] Volume sliders work for both affirmations and backing tracks
- [ ] Backing track selector opens and works
- [ ] Can select different backing tracks
- [ ] "Next affirmation in" timer shows when playing
- [ ] Affirmation texts display at bottom
- [ ] Play count increments when playing

## 8. Offline Functionality
- [ ] Turn off internet connection
- [ ] Previously generated affirmations still play
- [ ] Library browsing works offline
- [ ] Settings can be modified offline
- [ ] Player functions work offline
- [ ] Appropriate error messages for online-only features

## 9. Cost Control Features
- [ ] Quota warning appears when ElevenLabs quota is low
- [ ] Can proceed or cancel when quota is low
- [ ] Multiple concurrent requests are limited appropriately
- [ ] Error handling for rate limiting (429 errors)

## 10. Data Persistence
- [ ] Close and reopen app - data persists
- [ ] Generated affirmations remain after app restart
- [ ] Settings persist after app restart
- [ ] Play counts and other metadata persist

## 11. Error Handling
- [ ] Invalid API keys show appropriate errors
- [ ] Network errors are handled gracefully
- [ ] File system errors don't crash the app
- [ ] Malformed API responses are handled
- [ ] User-friendly error messages throughout

## 12. Performance
- [ ] App launches quickly (< 3 seconds)
- [ ] Navigation between screens is smooth
- [ ] Audio playback starts without delay
- [ ] No memory leaks during extended use
- [ ] Scrolling is smooth in library and other lists

## 13. Accessibility
- [ ] Text scales with system font size
- [ ] High contrast mode works
- [ ] Screen reader compatibility (if available)
- [ ] Touch targets are appropriately sized

## 14. Edge Cases
- [ ] Very long affirmation titles display correctly
- [ ] Large number of affirmations (20+) performs well
- [ ] Rapid button tapping doesn't cause issues
- [ ] App handles device rotation (if applicable)
- [ ] Background/foreground transitions work correctly

---

## Test Results Summary

### Web Platform
- [ ] All tests passed
- [ ] Issues found: ________________

### iOS Platform  
- [ ] All tests passed
- [ ] Issues found: ________________

### Android Platform
- [ ] All tests passed
- [ ] Issues found: ________________

## Critical Issues (App Breaking)
- [ ] None found
- [ ] Issues: ________________

## Minor Issues (UX/Polish)
- [ ] None found
- [ ] Issues: ________________

## Overall Assessment
- [ ] Ready for production
- [ ] Needs minor fixes
- [ ] Needs major fixes

**Tester:** ________________  
**Date:** ________________  
**Version:** 1.0.0


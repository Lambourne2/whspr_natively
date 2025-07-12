# Whspr - Your Personal Sleep Affirmation Studio

![Whspr Logo](./assets/images/icon.png)

**Version:** 1.0.0  
**Platform:** React Native (iOS, Android, Web)  
**License:** MIT  

## Overview

Whspr is a revolutionary mobile application that combines the power of artificial intelligence with the science of sleep affirmations to create personalized audio experiences for peaceful sleep and positive transformation. Built with React Native and Expo, Whspr offers a seamless cross-platform experience that works offline after initial setup.

### Key Features

- **AI-Powered Affirmation Generation**: Create custom affirmations using OpenRouter's advanced language models
- **High-Quality Text-to-Speech**: Convert affirmations to natural-sounding speech using ElevenLabs API
- **Healing Sound Frequencies**: Choose from scientifically-backed audio frequencies (Delta, Theta, Alpha waves, Solfeggio frequencies)
- **Offline Functionality**: Once generated, affirmations work completely offline
- **Smart Cost Control**: Built-in quota monitoring and rate limiting to manage API costs
- **Personalized Experience**: Customizable voices, tones, and loop gaps
- **Library Management**: Organize, search, and manage your affirmation collection

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Usage](#usage)
4. [API Integration](#api-integration)
5. [Architecture](#architecture)
6. [Development](#development)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)
11. [License](#license)

## Installation

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio and Android SDK (for Android development)
- OpenRouter API key ([Get one here](https://openrouter.ai))
- ElevenLabs API key ([Get one here](https://elevenlabs.io))

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Lambourne2/whspr_natively.git
   cd whspr_natively
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your preferred platform**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for Web browser

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional: Custom API endpoints
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
ELEVENLABS_BASE_URL=https://api.elevenlabs.io/v1

# Development settings
EXPO_PUBLIC_ENV=development
```

### API Keys Setup

#### OpenRouter API Key
1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Create an account and navigate to the API section
3. Generate a new API key
4. Add credits to your account for usage

#### ElevenLabs API Key
1. Visit [ElevenLabs.io](https://elevenlabs.io)
2. Create an account and go to your profile
3. Generate an API key in the API section
4. Note your character quota limits

### In-App Configuration

After installation, configure the app through the Settings screen:

1. Open the app and complete the onboarding
2. Navigate to Settings
3. Enter your API keys in the "API Configuration" section
4. Test the keys using the "Save & Test API Keys" button
5. Customize other preferences as needed

## Usage

### Creating Your First Affirmation

1. **Launch the app** and complete the onboarding process
2. **Tap "Create New Affirmation"** on the home screen
3. **Follow the wizard**:
   - Choose an intent (Sleep, Confidence, Healing, etc.)
   - Select a tone (Soft, Neutral, Uplifting)
   - Pick a voice (Soft Female, Calm Male, etc.)
   - Set loop gap and optional custom title
4. **Review and generate** your affirmations
5. **Wait for processing** (usually 30-60 seconds)
6. **Play immediately** or save to your library

### Quick Generation with AI

For faster creation:

1. **Tap "AI Generate"** on the home screen
2. **Choose a quick prompt** or enter a custom one
3. **Generate instantly** with default settings
4. **Customize later** if needed

### Playing Affirmations

1. **Open the player** by tapping any affirmation
2. **Select a backing track** from the library
3. **Adjust volumes** independently for affirmations and backing tracks
4. **Set fade in/out** preferences
5. **Start playback** and let the app guide your sleep

### Managing Your Library

- **Search** affirmations by title, intent, or tone
- **Filter** by category using the filter chips
- **Sort** by date, plays, or alphabetically
- **Rename** affirmations by tapping the edit icon
- **Share** affirmations with friends
- **Delete** unwanted affirmations

## API Integration

### OpenRouter Integration

Whspr uses OpenRouter to access various language models for affirmation generation:

```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'anthropic/claude-3-haiku',
    messages: [
      {
        role: 'user',
        content: `Generate ${count} ${tone} affirmations for ${intent}...`
      }
    ]
  })
});
```

### ElevenLabs Integration

Text-to-speech conversion is handled through ElevenLabs API:

```typescript
const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
  method: 'POST',
  headers: {
    'xi-api-key': apiKey,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: affirmationText,
    model_id: 'eleven_monolingual_v1',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5
    }
  })
});
```

### Rate Limiting and Cost Control

The app implements several cost control mechanisms:

- **Concurrent request limiting**: Maximum 3 simultaneous TTS calls
- **Quota monitoring**: Warns when ElevenLabs quota is low
- **Exponential backoff**: Handles rate limiting gracefully
- **Request queueing**: Manages API call frequency

## Architecture

### Project Structure

```
whspr_natively/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with navigation
│   ├── index.tsx          # Home screen
│   ├── create.tsx         # Affirmation creation wizard
│   ├── ai-generate.tsx    # Quick AI generation
│   ├── player.tsx         # Audio player
│   ├── library.tsx        # Affirmation library
│   ├── settings.tsx       # App settings
│   └── onboarding.tsx     # Welcome flow
├── components/            # Reusable UI components
│   └── Button.tsx         # Custom button component
├── services/              # Business logic and API calls
│   ├── apiService.ts      # OpenRouter & ElevenLabs integration
│   ├── audioService.ts    # Audio playback management
│   ├── offlineService.ts  # Offline functionality
│   └── costControlService.ts # Cost monitoring
├── store/                 # Zustand state management
│   ├── affirmationStore.ts # Affirmation data and player state
│   └── settingsStore.ts   # App settings and preferences
├── styles/                # Shared styling
│   └── commonStyles.ts    # Common styles and theme
├── utils/                 # Utility functions
│   └── errorLogger.ts     # Error handling and logging
├── assets/                # Static assets
│   ├── audio/            # Backing track files
│   └── images/           # App icons and images
└── __tests__/            # Unit tests
    ├── apiService.test.ts
    └── affirmationStore.test.ts
```

### State Management

Whspr uses Zustand for state management with two main stores:

#### Affirmation Store
- Manages affirmation data and metadata
- Handles audio player state
- Controls volume and playback settings
- Manages backing track library

#### Settings Store
- Stores user preferences and API keys
- Manages app configuration
- Handles theme and accessibility settings
- Persists data using AsyncStorage

### Data Flow

1. **User Input** → UI Components
2. **UI Components** → Zustand Actions
3. **Zustand Actions** → Service Layer
4. **Service Layer** → External APIs
5. **API Response** → Service Layer
6. **Service Layer** → Zustand Store
7. **Zustand Store** → UI Components (via subscriptions)

## Development

### Setting Up Development Environment

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

3. **Run on specific platforms**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

### Code Quality Tools

The project includes several code quality tools:

#### ESLint
```bash
npm run lint
```

#### Prettier
```bash
npm run format
```

#### TypeScript
```bash
npm run type-check
```

### Adding New Features

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Implement the feature**
   - Add new screens in `app/` directory
   - Create reusable components in `components/`
   - Add business logic to `services/`
   - Update stores if needed

3. **Write tests**
   ```bash
   npm run test
   ```

4. **Update documentation**
   - Update README if needed
   - Add inline code comments
   - Update API documentation

5. **Submit pull request**

### Debugging

#### React Native Debugger
1. Install React Native Debugger
2. Start the app in development mode
3. Open debugger and connect

#### Expo Dev Tools
1. Run `npm start`
2. Open Expo Dev Tools in browser
3. Use device logs and performance monitor

#### Console Logging
The app includes comprehensive logging:
```typescript
import { logger } from '../utils/errorLogger';

logger.info('User started affirmation generation');
logger.error('API call failed', error);
```

## Testing

### Unit Tests

Run unit tests with Vitest:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Manual Testing

Use the provided smoke test checklist:

1. Open `SMOKE_TEST_CHECKLIST.md`
2. Follow the step-by-step testing guide
3. Test on all target platforms
4. Document any issues found

### Test Coverage

Current test coverage includes:
- API service functionality
- State management (Zustand stores)
- Utility functions
- Error handling

### End-to-End Testing

For comprehensive testing:

1. **Test the complete user flow**
   - Onboarding → Settings → Creation → Playback
2. **Test offline functionality**
   - Generate affirmations online
   - Disconnect internet
   - Verify offline playback works
3. **Test error scenarios**
   - Invalid API keys
   - Network failures
   - Quota exhaustion

## Deployment

### Building for Production

#### iOS
```bash
# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

#### Android
```bash
# Build for Android
eas build --platform android

# Submit to Google Play
eas submit --platform android
```

#### Web
```bash
# Build for web
npm run build:web

# Deploy to hosting service
npm run deploy:web
```

### Environment Configuration

Create environment-specific configurations:

#### Production (.env.production)
```env
EXPO_PUBLIC_ENV=production
OPENROUTER_API_KEY=prod_key_here
ELEVENLABS_API_KEY=prod_key_here
```

#### Staging (.env.staging)
```env
EXPO_PUBLIC_ENV=staging
OPENROUTER_API_KEY=staging_key_here
ELEVENLABS_API_KEY=staging_key_here
```

### Release Process

1. **Update version numbers**
   ```bash
   npm version patch  # or minor/major
   ```

2. **Update changelog**
   - Document new features
   - List bug fixes
   - Note breaking changes

3. **Build and test**
   ```bash
   npm run build
   npm run test
   ```

4. **Deploy to stores**
   ```bash
   eas build --platform all
   eas submit --platform all
   ```

## Troubleshooting

### Common Issues

#### API Key Errors
**Problem**: "API key not configured" error
**Solution**: 
1. Check `.env` file exists and contains valid keys
2. Restart the development server
3. Verify keys in Settings screen

#### Audio Playback Issues
**Problem**: Affirmations don't play
**Solution**:
1. Check device volume settings
2. Verify audio files exist in local storage
3. Test with different backing tracks

#### Generation Failures
**Problem**: Affirmation generation fails
**Solution**:
1. Check internet connectivity
2. Verify API quota hasn't been exceeded
3. Check API service status

#### Performance Issues
**Problem**: App runs slowly
**Solution**:
1. Clear app cache in Settings
2. Reduce number of stored affirmations
3. Restart the app

### Debug Mode

Enable debug mode for detailed logging:

1. Open Settings
2. Tap app version 7 times
3. Enable "Debug Mode"
4. Check console for detailed logs

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this README and inline comments
- **Community**: Join our Discord server for support
- **Email**: Contact support@whspr.app

## Contributing

We welcome contributions to Whspr! Please follow these guidelines:

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

### Contribution Process

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests for new functionality**
5. **Update documentation**
6. **Submit a pull request**

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Include tests for new features
- Update documentation as needed

### Reporting Issues

When reporting issues, please include:
- Device and OS version
- App version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **OpenRouter** for providing access to advanced language models
- **ElevenLabs** for high-quality text-to-speech technology
- **Expo** for the excellent React Native development platform
- **React Native Community** for the amazing ecosystem

## Changelog

### Version 1.0.0 (Current)
- Initial release
- AI-powered affirmation generation
- High-quality text-to-speech
- Offline functionality
- Cost control features
- Cross-platform support (iOS, Android, Web)

---

**Made with ❤️ for peaceful sleep and positive transformation**

For more information, visit [whspr.app](https://whspr.app) or contact us at support@whspr.app.


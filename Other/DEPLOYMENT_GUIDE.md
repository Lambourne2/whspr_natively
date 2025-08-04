# Whspr Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Whspr application across all supported platforms: iOS, Android, and Web. The deployment process uses Expo Application Services (EAS) for mobile platforms and standard web hosting for the web version.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [iOS Deployment](#ios-deployment)
4. [Android Deployment](#android-deployment)
5. [Web Deployment](#web-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring and Analytics](#monitoring-and-analytics)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts and Tools

1. **Expo Account** - [Sign up at expo.dev](https://expo.dev)
2. **Apple Developer Account** - Required for iOS App Store deployment ($99/year)
3. **Google Play Console Account** - Required for Android Play Store deployment ($25 one-time)
4. **EAS CLI** - Install globally: `npm install -g eas-cli`
5. **Git Repository** - For version control and CI/CD

### Development Environment

Ensure your development environment is properly configured:

```bash
# Install required tools
npm install -g @expo/cli eas-cli

# Verify installations
expo --version
eas --version

# Login to Expo
expo login
eas login
```

### Project Configuration

Verify your project configuration files are properly set up:

- `app.json` - Expo configuration
- `eas.json` - EAS Build configuration
- `.env` files - Environment variables
- `package.json` - Dependencies and scripts

## Environment Setup

### EAS Configuration

Create or verify your `eas.json` configuration:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "resourceClass": "medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "resourceClass": "medium"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "resourceClass": "medium"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Environment Variables

Set up environment-specific configurations:

#### Production Environment (.env.production)
```env
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_URL=https://api.whspr.app
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
EXPO_PUBLIC_ANALYTICS_ID=your_analytics_id_here
```

#### Staging Environment (.env.staging)
```env
EXPO_PUBLIC_ENV=staging
EXPO_PUBLIC_API_URL=https://staging-api.whspr.app
EXPO_PUBLIC_SENTRY_DSN=your_staging_sentry_dsn_here
EXPO_PUBLIC_ANALYTICS_ID=your_staging_analytics_id_here
```

### App Configuration

Update `app.json` for production deployment:

```json
{
  "expo": {
    "name": "Whspr",
    "slug": "whspr-sleep-affirmations",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1a2e"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.whspr.sleepaffirmations",
      "buildNumber": "1",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "This app uses the microphone for voice recording features.",
        "NSCameraUsageDescription": "This app uses the camera for profile pictures."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#1a1a2e"
      },
      "package": "com.whspr.sleepaffirmations",
      "versionCode": 1,
      "permissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS"
      ]
    },
    "web": {
      "favicon": "./assets/images/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-router",
      [
        "expo-av",
        {
          "microphonePermission": "Allow Whspr to access your microphone for voice features."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

## iOS Deployment

### Step 1: Prepare iOS Build

1. **Update version and build number**
   ```bash
   # Update version in app.json
   # Increment buildNumber for each submission
   ```

2. **Configure iOS-specific settings**
   ```json
   {
     "ios": {
       "supportsTablet": true,
       "bundleIdentifier": "com.whspr.sleepaffirmations",
       "buildNumber": "1",
       "infoPlist": {
         "NSMicrophoneUsageDescription": "This app uses the microphone for voice recording features.",
         "UIBackgroundModes": ["audio"]
       }
     }
   }
   ```

### Step 2: Build for iOS

```bash
# Build for production
eas build --platform ios --profile production

# Build for internal testing
eas build --platform ios --profile preview
```

### Step 3: Test the Build

1. **Download the build** from EAS dashboard
2. **Install on test devices** using TestFlight or direct installation
3. **Run through smoke test checklist**
4. **Verify all features work correctly**

### Step 4: Submit to App Store

```bash
# Submit to App Store Connect
eas submit --platform ios --profile production

# Or submit manually through App Store Connect
```

### Step 5: App Store Connect Configuration

1. **Login to App Store Connect**
2. **Create new app** if first submission
3. **Fill out app information**:
   - App Name: "Whspr - Sleep Affirmations"
   - Subtitle: "AI-Powered Sleep & Relaxation"
   - Keywords: "sleep, affirmations, meditation, relaxation, AI"
   - Description: [Use marketing copy from README]
   - Screenshots: Prepare for all device sizes
   - App Review Information: Provide demo account if needed

4. **Configure pricing and availability**
5. **Submit for review**

### iOS Review Guidelines

Ensure compliance with Apple's guidelines:

- **Privacy Policy** - Required for apps that collect data
- **Terms of Service** - Recommended for subscription apps
- **Age Rating** - Set appropriate age rating (likely 4+)
- **Content Warnings** - None required for Whspr
- **Accessibility** - Ensure VoiceOver compatibility

## Android Deployment

### Step 1: Prepare Android Build

1. **Update version and version code**
   ```json
   {
     "android": {
       "package": "com.whspr.sleepaffirmations",
       "versionCode": 1
     }
   }
   ```

2. **Configure Android-specific settings**
   ```json
   {
     "android": {
       "adaptiveIcon": {
         "foregroundImage": "./assets/images/adaptive-icon.png",
         "backgroundColor": "#1a1a2e"
       },
       "permissions": [
         "android.permission.RECORD_AUDIO",
         "android.permission.MODIFY_AUDIO_SETTINGS",
         "android.permission.WAKE_LOCK"
       ]
     }
   }
   ```

### Step 2: Build for Android

```bash
# Build AAB for Play Store
eas build --platform android --profile production

# Build APK for testing
eas build --platform android --profile preview
```

### Step 3: Test the Build

1. **Download APK/AAB** from EAS dashboard
2. **Install on test devices**
3. **Test on various Android versions** (minimum API 21)
4. **Verify permissions work correctly**

### Step 4: Submit to Google Play

```bash
# Submit to Google Play Console
eas submit --platform android --profile production
```

### Step 5: Google Play Console Configuration

1. **Login to Google Play Console**
2. **Create new app** if first submission
3. **Complete app details**:
   - App name: "Whspr - Sleep Affirmations"
   - Short description: "AI-powered sleep affirmations for peaceful rest"
   - Full description: [Use marketing copy from README]
   - Graphics: Icon, feature graphic, screenshots
   - Categorization: Health & Fitness > Sleep

4. **Configure content rating**
5. **Set up pricing and distribution**
6. **Submit for review**

### Android Review Process

Google Play review typically takes 1-3 days:

- **Policy Compliance** - Ensure no policy violations
- **Security Scan** - Automated security checks
- **Content Review** - Manual review of app content
- **Technical Review** - App functionality verification

## Web Deployment

### Step 1: Build for Web

```bash
# Build web version
npx expo export --platform web

# The build output will be in the dist/ directory
```

### Step 2: Configure Web-Specific Settings

Update `app.json` for web deployment:

```json
{
  "web": {
    "favicon": "./assets/images/favicon.png",
    "bundler": "metro",
    "output": "static",
    "lang": "en"
  }
}
```

### Step 3: Deploy to Hosting Service

#### Option 1: Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure custom domain
vercel domains add whspr.app
```

#### Option 2: Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Configure custom domain in Netlify dashboard
```

#### Option 3: AWS S3 + CloudFront

```bash
# Upload to S3
aws s3 sync dist/ s3://whspr-app-bucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Step 4: Configure Domain and SSL

1. **Point domain** to hosting service
2. **Configure SSL certificate** (usually automatic)
3. **Set up redirects** (www to non-www, etc.)
4. **Configure caching headers** for optimal performance

### Web Performance Optimization

1. **Enable compression** (gzip/brotli)
2. **Configure caching** for static assets
3. **Set up CDN** for global distribution
4. **Monitor Core Web Vitals**

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Whspr

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linting
        run: npm run lint

  build-ios:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build iOS
        run: eas build --platform ios --profile production --non-interactive

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Android
        run: eas build --platform android --profile production --non-interactive

  deploy-web:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build web
        run: npx expo export --platform web
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./dist
```

### Required Secrets

Configure these secrets in your GitHub repository:

- `EXPO_TOKEN` - Expo authentication token
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

## Monitoring and Analytics

### Error Tracking with Sentry

1. **Install Sentry**
   ```bash
   npm install @sentry/react-native
   ```

2. **Configure Sentry**
   ```typescript
   import * as Sentry from '@sentry/react-native';
   
   Sentry.init({
     dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
     environment: process.env.EXPO_PUBLIC_ENV,
   });
   ```

### Analytics with Expo Analytics

1. **Configure analytics**
   ```typescript
   import { Analytics } from 'expo-analytics';
   
   const analytics = new Analytics(process.env.EXPO_PUBLIC_ANALYTICS_ID);
   
   // Track events
   analytics.event('affirmation_generated', {
     intent: 'sleep',
     voice: 'soft_female',
   });
   ```

### Performance Monitoring

1. **Monitor app performance**
   - App launch time
   - Screen transition times
   - API response times
   - Memory usage

2. **Set up alerts** for critical metrics
3. **Create dashboards** for monitoring

## Troubleshooting

### Common Build Issues

#### iOS Build Failures

**Issue**: Code signing errors
**Solution**: 
```bash
# Clear credentials and reconfigure
eas credentials:configure --platform ios
```

**Issue**: Missing provisioning profile
**Solution**:
```bash
# Generate new provisioning profile
eas build --platform ios --clear-cache
```

#### Android Build Failures

**Issue**: Gradle build errors
**Solution**:
```bash
# Clear build cache
eas build --platform android --clear-cache
```

**Issue**: Keystore issues
**Solution**:
```bash
# Reset keystore
eas credentials:configure --platform android
```

### Deployment Issues

#### App Store Rejection

Common reasons and solutions:

1. **Missing privacy policy** - Add privacy policy URL
2. **Incomplete app information** - Fill all required fields
3. **Screenshots don't match app** - Update screenshots
4. **App crashes on review** - Test thoroughly before submission

#### Google Play Rejection

Common reasons and solutions:

1. **Policy violations** - Review Google Play policies
2. **Missing content rating** - Complete content rating questionnaire
3. **APK issues** - Ensure APK is properly signed
4. **Permissions not justified** - Explain permission usage

### Performance Issues

#### Slow Build Times

Solutions:
- Use appropriate resource classes in EAS
- Optimize dependencies
- Use build caching
- Consider upgrading EAS plan

#### Large Bundle Size

Solutions:
- Remove unused dependencies
- Optimize images and assets
- Use code splitting for web
- Enable Hermes for Android

### Monitoring and Debugging

#### Production Debugging

1. **Enable crash reporting** with Sentry
2. **Set up remote logging** for critical errors
3. **Monitor user feedback** in app stores
4. **Use analytics** to identify usage patterns

#### Performance Monitoring

1. **Track key metrics**:
   - App launch time
   - Screen load times
   - API response times
   - Memory usage

2. **Set up alerts** for performance degradation
3. **Regular performance audits**

---

This deployment guide provides comprehensive instructions for deploying Whspr across all platforms. For additional support, refer to the Expo documentation or contact the development team.


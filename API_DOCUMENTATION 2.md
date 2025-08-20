# Whspr API Documentation

## Overview

This document provides comprehensive documentation for the API integrations used in the Whspr application. Whspr integrates with two primary external APIs to deliver its core functionality:

1. **OpenRouter API** - For AI-powered affirmation generation
2. **ElevenLabs API** - For high-quality text-to-speech synthesis

## Table of Contents

1. [OpenRouter API Integration](#openrouter-api-integration)
2. [ElevenLabs API Integration](#elevenlabs-api-integration)
3. [Internal API Service](#internal-api-service)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Cost Control](#cost-control)
7. [Testing](#testing)

## OpenRouter API Integration

### Overview

OpenRouter provides access to multiple language models through a unified API. Whspr uses this service to generate personalized affirmations based on user preferences.

### Base URL
```
https://openrouter.ai/api/v1
```

### Authentication

All requests require an API key in the Authorization header:
```
Authorization: Bearer YOUR_API_KEY
```

### Endpoints Used

#### Generate Chat Completions

**Endpoint:** `POST /chat/completions`

**Purpose:** Generate affirmations using AI language models

**Request Headers:**
```json
{
  "Authorization": "Bearer YOUR_API_KEY",
  "Content-Type": "application/json",
  "HTTP-Referer": "https://whspr.app",
  "X-Title": "Whspr - Sleep Affirmation Studio"
}
```

**Request Body:**
```json
{
  "model": "anthropic/claude-3-haiku",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert in creating personalized sleep affirmations..."
    },
    {
      "role": "user",
      "content": "Generate 8 soft affirmations for sleep that are personal, present-tense, and positive..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "anthropic/claude-3-haiku",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "[\"I am peaceful and calm\", \"I sleep deeply and restfully\", ...]"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  }
}
```

### Supported Models

Whspr primarily uses these models for different use cases:

- **anthropic/claude-3-haiku** - Fast, cost-effective for standard affirmations
- **anthropic/claude-3-sonnet** - Higher quality for complex requests
- **openai/gpt-3.5-turbo** - Alternative option for variety

### Prompt Engineering

The application uses carefully crafted prompts to ensure high-quality affirmations:

```typescript
const systemPrompt = `You are an expert in creating personalized sleep affirmations that promote deep relaxation, positive self-talk, and peaceful sleep. Your affirmations should be:

1. Personal and present-tense (using "I am", "I have", "I feel")
2. Positive and uplifting without being overly energetic
3. Focused on the specific intent provided
4. Appropriate for the tone requested
5. Suitable for repetitive listening during sleep

Always return your response as a valid JSON array of strings, with no additional text or formatting.`;

const userPrompt = `Generate ${count} ${tone} affirmations for ${intent} that are:
- Personal and present-tense
- ${tone} in tone and delivery
- Focused on ${intent}
- Between 5-15 words each
- Suitable for sleep and relaxation

Return only a JSON array of affirmation strings.`;
```

## ElevenLabs API Integration

### Overview

ElevenLabs provides advanced text-to-speech synthesis with natural-sounding voices. Whspr uses this service to convert generated affirmations into high-quality audio.

### Base URL
```
https://api.elevenlabs.io/v1
```

### Authentication

All requests require an API key in the xi-api-key header:
```
xi-api-key: YOUR_API_KEY
```

### Endpoints Used

#### Text-to-Speech Synthesis

**Endpoint:** `POST /text-to-speech/{voice_id}`

**Purpose:** Convert text affirmations to speech audio

**Request Headers:**
```json
{
  "xi-api-key": "YOUR_API_KEY",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "text": "I am peaceful and calm, ready for restful sleep",
  "model_id": "eleven_monolingual_v1",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.5,
    "style": 0.0,
    "use_speaker_boost": true
  }
}
```

**Response:** Binary audio data (MP3 format)

#### Get User Subscription Info

**Endpoint:** `GET /user/subscription`

**Purpose:** Check quota and usage limits

**Request Headers:**
```json
{
  "xi-api-key": "YOUR_API_KEY"
}
```

**Response:**
```json
{
  "subscription": {
    "tier": "starter",
    "character_count": 5000,
    "character_limit": 10000,
    "can_extend_character_limit": true,
    "allowed_to_extend_character_limit": true,
    "next_character_count_reset_unix": 1677652288,
    "voice_limit": 10,
    "professional_voice_limit": 1,
    "can_extend_voice_limit": true,
    "can_use_instant_voice_cloning": true,
    "can_use_professional_voice_cloning": true,
    "currency": "usd",
    "status": "active"
  }
}
```

### Voice Configuration

Whspr supports multiple voice options mapped to ElevenLabs voice IDs:

```typescript
const VOICE_MAPPING = {
  soft_female: 'EXAVITQu4vr4xnSDxMaL',     // Bella - Soft, gentle female
  calm_male: 'VR6AewLTigWG4xSOukaG',       // Arnold - Deep, calming male
  warm_female: 'ThT5KcBeYPX3keUQqHPh',     // Dorothy - Warm, friendly female
  gentle_male: 'ZQe5CqHNLWdVhrnuHIhO',     // Antoni - Gentle, peaceful male
};
```

### Audio Processing

The application processes audio responses as follows:

1. **Receive binary data** from ElevenLabs API
2. **Save to local file system** using Expo FileSystem
3. **Generate metadata** including duration and file size
4. **Store file path** in local database for offline access

```typescript
const audioData = await response.arrayBuffer();
const fileName = `affirmation_${Date.now()}.mp3`;
const filePath = `${FileSystem.documentDirectory}${fileName}`;

await FileSystem.writeAsStringAsync(
  filePath,
  Buffer.from(audioData).toString('base64'),
  { encoding: FileSystem.EncodingType.Base64 }
);
```

## Internal API Service

### Service Architecture

The `apiService` module provides a centralized interface for all external API calls:

```typescript
class ApiService {
  private async makeRequest(url: string, options: RequestInit): Promise<any>
  async generateAffirmations(params: GenerationParams): Promise<GenerationResult>
  async synthesizeSpeech(params: SynthesisParams): Promise<SynthesisResult>
  async checkQuota(): Promise<QuotaInfo>
}
```

### Request Flow

1. **Validation** - Check API keys and parameters
2. **Rate Limiting** - Ensure compliance with API limits
3. **Request** - Make HTTP request with proper headers
4. **Retry Logic** - Handle temporary failures with exponential backoff
5. **Response Processing** - Parse and validate response data
6. **Error Handling** - Provide meaningful error messages

### Configuration

The service uses environment variables and user settings:

```typescript
const config = {
  openRouter: {
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    apiKey: settings.openRouterApiKey,
    model: 'anthropic/claude-3-haiku',
    maxRetries: 3,
    retryDelay: 1000,
  },
  elevenLabs: {
    baseUrl: process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1',
    apiKey: settings.elevenLabsApiKey,
    model: 'eleven_monolingual_v1',
    maxRetries: 3,
    retryDelay: 2000,
  },
};
```

## Error Handling

### Error Types

The application handles several categories of errors:

#### Authentication Errors (401)
```typescript
if (response.status === 401) {
  throw new Error('Invalid API key. Please check your configuration.');
}
```

#### Rate Limiting Errors (429)
```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
}
```

#### Quota Exceeded Errors (402)
```typescript
if (response.status === 402) {
  throw new Error('Quota exceeded. Please upgrade your plan or wait for reset.');
}
```

#### Network Errors
```typescript
catch (error) {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new Error('Network error. Please check your internet connection.');
  }
  throw error;
}
```

### Error Recovery

The application implements several error recovery strategies:

1. **Exponential Backoff** - Retry failed requests with increasing delays
2. **Fallback Models** - Switch to alternative AI models if primary fails
3. **Graceful Degradation** - Continue operation with reduced functionality
4. **User Notification** - Provide clear error messages and suggested actions

## Rate Limiting

### OpenRouter Rate Limits

- **Requests per minute**: Varies by model and plan
- **Tokens per minute**: Model-specific limits
- **Concurrent requests**: Typically 10-50 depending on plan

### ElevenLabs Rate Limits

- **Characters per month**: Plan-dependent (10K-500K+)
- **Requests per minute**: 120 for most plans
- **Concurrent requests**: 2-10 depending on plan

### Implementation

The application implements rate limiting through:

```typescript
class RateLimiter {
  private requestQueue: Map<string, Promise<any>> = new Map();
  private lastRequestTime: number = 0;
  private minInterval: number = 500; // 500ms between requests

  async throttle<T>(key: string, request: () => Promise<T>): Promise<T> {
    // Wait for minimum interval
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastRequest)
      );
    }

    // Execute request
    this.lastRequestTime = Date.now();
    return await request();
  }
}
```

## Cost Control

### Monitoring

The application continuously monitors API usage:

```typescript
interface UsageStats {
  elevenLabsUsage: {
    used: number;
    total: number;
    remaining: number;
    percentageUsed: number;
  };
  requestCounts: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
  };
}
```

### Alerts

Users receive alerts when approaching limits:

- **Warning at 75%** - "You're approaching your quota limit"
- **Critical at 90%** - "Very low quota remaining"
- **Blocked at 100%** - "Quota exceeded, please upgrade"

### Optimization

The application optimizes costs through:

1. **Batch Processing** - Combine multiple affirmations in single requests
2. **Caching** - Store generated content locally
3. **Compression** - Use efficient audio formats
4. **Smart Retry** - Avoid unnecessary retry attempts

## Testing

### Unit Tests

API service functionality is thoroughly tested:

```typescript
describe('ApiService', () => {
  it('should generate affirmations successfully', async () => {
    const result = await apiService.generateAffirmations({
      intent: 'sleep',
      tone: 'soft',
      count: 3,
    });
    
    expect(result.affirmations).toHaveLength(3);
    expect(result.affirmations[0]).toMatch(/^I am|I feel|I have/);
  });

  it('should handle rate limiting gracefully', async () => {
    // Mock 429 response followed by success
    mockFetch
      .mockResolvedValueOnce({ status: 429, statusText: 'Too Many Requests' })
      .mockResolvedValueOnce({ ok: true, json: () => mockResponse });

    const result = await apiService.generateAffirmations(params);
    expect(result).toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
```

### Integration Tests

End-to-end API testing:

```typescript
describe('API Integration', () => {
  it('should complete full affirmation generation flow', async () => {
    // Generate affirmations
    const generation = await apiService.generateAffirmations(params);
    
    // Synthesize speech for each affirmation
    const audioPromises = generation.affirmations.map(text =>
      apiService.synthesizeSpeech({ text, voice: 'soft_female' })
    );
    
    const audioResults = await Promise.all(audioPromises);
    
    // Verify all audio was generated
    audioResults.forEach(result => {
      expect(result.audioData).toBeDefined();
      expect(result.audioData.byteLength).toBeGreaterThan(0);
    });
  });
});
```

### Mock Services

For development and testing, mock services are provided:

```typescript
class MockApiService implements ApiService {
  async generateAffirmations(params: GenerationParams): Promise<GenerationResult> {
    return {
      affirmations: [
        'I am peaceful and calm',
        'I sleep deeply and restfully',
        'I wake up refreshed and energized',
      ],
      metadata: {
        model: 'mock-model',
        tokensUsed: 100,
        requestId: 'mock-request-id',
      },
    };
  }

  async synthesizeSpeech(params: SynthesisParams): Promise<SynthesisResult> {
    // Return mock audio data
    const mockAudio = new ArrayBuffer(1000);
    return {
      audioData: mockAudio,
      metadata: {
        voice: params.voice,
        charactersUsed: params.text.length,
        requestId: 'mock-audio-request',
      },
    };
  }
}
```

## Best Practices

### API Key Security

1. **Never commit API keys** to version control
2. **Use environment variables** for configuration
3. **Validate keys** before making requests
4. **Rotate keys regularly** for security

### Request Optimization

1. **Batch requests** when possible
2. **Cache responses** to avoid duplicate calls
3. **Use appropriate timeouts** for network requests
4. **Implement proper retry logic** with exponential backoff

### Error Handling

1. **Provide meaningful error messages** to users
2. **Log errors** for debugging and monitoring
3. **Implement fallback strategies** for critical failures
4. **Test error scenarios** thoroughly

### Performance

1. **Monitor response times** and optimize slow requests
2. **Use streaming** for large responses when available
3. **Implement request cancellation** for user-initiated stops
4. **Profile memory usage** to prevent leaks

---

This documentation provides a comprehensive guide to the API integrations in Whspr. For additional support or questions, please refer to the main README or contact the development team.


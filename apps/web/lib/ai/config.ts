/**
 * AI Model Configuration
 * 
 * Centralized configuration for all AI models used in the application.
 * Update model versions here when new versions are released.
 * 
 * PRICING (as of late 2024):
 * - Claude 3.5 Sonnet: $3/1M input, $15/1M output (best for complex reasoning)
 * - GPT-4o: $5/1M input, $15/1M output (good alternative)
 * - GPT-4o-mini: $0.15/1M input, $0.60/1M output (best for simple tasks)
 * - Whisper-1: $0.006/minute (audio transcription)
 */

export const AI_MODELS = {
  // Primary models for different task types
  
  /**
   * For complex reasoning, analysis, and the main AI assistant
   * Best-in-class for nuanced understanding and multi-step reasoning
   */
  REASONING: 'claude-3-5-sonnet-20241022',
  
  /**
   * For simple, fast tasks like content generation, chat suggestions
   * 67x cheaper than GPT-4 Turbo, excellent for most tasks
   */
  FAST: 'gpt-4o-mini',
  
  /**
   * For audio transcription (Whisper is the only viable option)
   */
  TRANSCRIPTION: 'whisper-1',
  
  /**
   * OpenRouter model identifier for Claude (used in key detection)
   */
  OPENROUTER_REASONING: 'anthropic/claude-3.5-sonnet',
} as const;

/**
 * Model selection guide:
 * 
 * Use REASONING model for:
 * - AI Assistant conversations
 * - Tour route optimization (geographic + business reasoning)
 * - Royalty split analysis (fairness + legal reasoning)
 * - Music theory analysis (complex pattern recognition)
 * 
 * Use FAST model for:
 * - Chat suggestions
 * - Content generation (social media, emails)
 * - Mix suggestions
 * - Action item extraction from transcriptions
 */

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];

/**
 * Temperature settings for different tasks
 */
export const AI_TEMPERATURES = {
  /** For factual, consistent responses */
  PRECISE: 0.3,
  /** For balanced responses */
  BALANCED: 0.5,
  /** For creative content */
  CREATIVE: 0.7,
  /** For highly creative content */
  VERY_CREATIVE: 0.8,
} as const;

/**
 * Max token limits for different response types
 */
export const AI_MAX_TOKENS = {
  /** Short responses (2-3 sentences) */
  SHORT: 150,
  /** Medium responses */
  MEDIUM: 300,
  /** Long responses */
  LONG: 500,
  /** Very long responses */
  VERY_LONG: 800,
  /** Full conversations */
  CONVERSATION: 1024,
  /** Complex analysis */
  ANALYSIS: 2000,
} as const;


// Feature flags for enabling/disabling functionality
export const FEATURE_FLAGS = {
  // Share/Export features
  SHOW_SEPARATE_DOWNLOAD_BUTTON: false,
  ENABLE_TEXT_EXPORT: false,
  ENABLE_SHARE_IMAGE: false,

  // Debug features
  SHOW_DEBUG_BUTTON: true, // "See Example" button
  SHOW_ANIMATION_DEBUG_CONTROLS: false, // Pause/restart/phase controls in animated share card

  // Animation features
  SHOW_PASSIVE_TRAITS_PHASE: false, // Set to false to skip passive traits in animation
  ENABLE_SHAREABLE_CARD_IMAGE: false, // ShareableCard image generation broken as of 4 Sep 2025

  // Future features (examples)
  ENABLE_PHOTO_UPLOAD: true,
  ENABLE_SOCIAL_SHARING: true,
  ENABLE_ANALYTICS: false, // For when we add usage tracking
  SHOW_BETA_FEATURES: false, // For experimental features
  ENABLE_CHARACTER_COMPARISON: false, // Compare with friends feature
} as const;

// Helper function to check if a feature is enabled
export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flag];
}

// Environment-based overrides (useful for development)
export function getFeatureFlags() {
  const flags = { ...FEATURE_FLAGS };

  // In development, you might want to enable certain debug features
  if (import.meta.env.DEV) {
    // flags.SHOW_BETA_FEATURES = true;
  }

  return flags;
}

// API Configuration
export const API_CONFIG = {
  // Choose between Claude models by commenting/uncommenting:
  // CLAUDE_MODEL: 'claude-3-5-haiku-20241022' as const, // Faster and cheaper
  CLAUDE_MODEL: 'claude-sonnet-4-20250514' as const, // Best quality (~5-10s) and reasoning, slower and more expensive
} as const;

export type ClaudeModel =
  | 'claude-3-5-haiku-20241022'
  | 'claude-sonnet-4-20250514';

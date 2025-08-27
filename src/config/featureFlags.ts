// Feature flags for enabling/disabling functionality
export const FEATURE_FLAGS = {
  // Share/Export features
  SHOW_SEPARATE_DOWNLOAD_BUTTON: false, // Redundant now that main share button downloads
  ENABLE_TEXT_EXPORT: true, // Keep the full character sheet text export

  // Debug features
  SHOW_DEBUG_BUTTON: true, // "See Example" button

  // Future features (examples)
  ENABLE_PHOTO_UPLOAD: true,
  ENABLE_SOCIAL_SHARING: true,
  ENABLE_ANALYTICS: false, // For when we add usage tracking
  SHOW_BETA_FEATURES: false, // For experimental features
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

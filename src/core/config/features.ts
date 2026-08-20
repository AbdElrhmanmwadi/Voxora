// Public build-time switches only. Never place credentials or secrets here.
export const VOICE_ENABLED = import.meta.env.VITE_VOICE_ENABLED === 'true'

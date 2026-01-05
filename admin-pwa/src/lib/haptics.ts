export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error'

export function triggerHaptic(pattern: HapticPattern = 'medium') {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return

  const patterns: Record<HapticPattern, number[]> = {
    light: [10],
    medium: [20],
    heavy: [30],
    success: [10, 50, 10],
    error: [50, 100, 50],
  }

  navigator.vibrate(patterns[pattern])
}

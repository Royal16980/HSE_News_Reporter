import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes with proper precedence
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate reading time based on average reading speed
 * @param text - Article content in markdown or plain text
 * @param wordsPerMinute - Average reading speed (default: 200 wpm)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return minutes
}

/**
 * Format date for display
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj)
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds)
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
    }
  }

  return 'Just now'
}

/**
 * Generate slug from title
 * @param title - Article title
 * @returns URL-safe slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Get category color based on category name
 * @param category - Category name
 * @returns Tailwind color classes
 */
export function getCategoryColor(category: string): {
  bg: string
  text: string
  border: string
} {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    incidents: {
      bg: 'bg-incident-light/20 dark:bg-incident/20',
      text: 'text-incident dark:text-incident-light',
      border: 'border-incident/30',
    },
    regulations: {
      bg: 'bg-regulation-light/20 dark:bg-regulation/20',
      text: 'text-regulation dark:text-regulation-light',
      border: 'border-regulation/30',
    },
    'best-practices': {
      bg: 'bg-practice-light/20 dark:bg-practice/20',
      text: 'text-practice dark:text-practice-light',
      border: 'border-practice/30',
    },
    'workplace-safety': {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200',
    },
    'fire-safety': {
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-200',
    },
    'chemical-safety': {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200',
    },
    construction: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      text: 'text-yellow-700 dark:text-yellow-300',
      border: 'border-yellow-200',
    },
    healthcare: {
      bg: 'bg-pink-50 dark:bg-pink-950/30',
      text: 'text-pink-700 dark:text-pink-300',
      border: 'border-pink-200',
    },
    'food-safety': {
      bg: 'bg-green-50 dark:bg-green-950/30',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-200',
    },
    ergonomics: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200',
    },
    'mental-health': {
      bg: 'bg-teal-50 dark:bg-teal-950/30',
      text: 'text-teal-700 dark:text-teal-300',
      border: 'border-teal-200',
    },
  }

  return (
    colors[category.toLowerCase()] || {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200',
    }
  )
}

/**
 * Share article using Web Share API or fallback to clipboard
 * @param title - Article title
 * @param url - Article URL
 */
export async function shareArticle(title: string, url: string): Promise<void> {
  if ('share' in navigator) {
    try {
      await navigator.share({ title, url })
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error)
      }
    }
  } else {
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url)
      // You could show a toast notification here
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }
}

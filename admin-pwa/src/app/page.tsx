import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="safe-top safe-bottom flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-100 via-white to-slate-50 px-6 py-10 text-center dark:from-oled-black dark:via-black dark:to-oled-black">
      <div className="w-full max-w-xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-safety-blue/10 px-4 py-2 text-xs font-semibold text-safety-blue">
          <Sparkles className="h-4 w-4" />
          Mobile admin for HSE News
        </div>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
          Review, approve, and schedule news from your phone.
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Installable PWA with offline support, swipe gestures, and push notifications for rapid content moderation.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/analytics"
            className="flex items-center justify-center gap-2 rounded-button bg-safety-blue px-5 py-3 font-semibold text-white shadow-card transition hover:bg-safety-blue-600"
          >
            Open Dashboard
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/review"
            className="rounded-button border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800 shadow-sm transition hover:border-safety-blue hover:text-safety-blue dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            Review Queue
          </Link>
        </div>
      </div>
    </main>
  )
}

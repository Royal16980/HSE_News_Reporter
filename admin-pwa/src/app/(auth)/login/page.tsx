import Link from 'next/link'
import { Shield, Sparkles } from 'lucide-react'

import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-100 via-white to-slate-50 px-6 py-10 dark:from-oled-black dark:via-black dark:to-oled-black">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center gap-3 text-safety-blue">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-safety-blue/10">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-safety-blue-700">HSE News</p>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Console</h1>
          </div>
        </div>

        <LoginForm />

        <div className="flex items-start gap-2 rounded-2xl bg-white/70 px-4 py-3 text-sm shadow-inner backdrop-blur dark:bg-gray-900/80">
          <Sparkles className="mt-0.5 h-4 w-4 text-safety-blue" />
          <div>
            <p className="font-semibold">Tip</p>
            <p className="text-gray-600 dark:text-gray-300">
              Install this PWA on your phone for swipe gestures, haptics, and offline review while in the field.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500">
          Need access?{' '}
          <Link href="mailto:admin@hsenews.uk" className="font-semibold text-safety-blue">
            Contact the HSE team
          </Link>
        </p>
      </div>
    </main>
  )
}

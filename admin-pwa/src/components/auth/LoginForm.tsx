'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Smartphone } from 'lucide-react'

import { useAuthStore } from '@/stores/auth'
import { BiometricAuth } from './BiometricAuth'
import { usePWAInstall } from '@/lib/pwa'
import { triggerHaptic } from '@/lib/haptics'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Enter a valid work email'),
})

type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })
  const [submitted, setSubmitted] = useState(false)
  const { sendMagicLink, loading, error } = useAuthStore()
  const { install, canInstall, isInstalled } = usePWAInstall()

  const onSubmit = async (values: FormValues) => {
    await sendMagicLink(values.email)
    setSubmitted(true)
    triggerHaptic('success')
  }

  return (
    <div className="space-y-6 rounded-2xl bg-white/80 p-6 shadow-card backdrop-blur dark:bg-black/60">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Sign in to continue</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Enter your work email to receive a magic login link. This app works best when installed to your home screen.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm text-gray-700 dark:text-gray-200">Email</span>
          <div
            className={cn(
              'flex items-center gap-3 rounded-button border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-inner transition',
              'focus-within:border-safety-blue focus-within:ring-2 focus-within:ring-safety-blue/30',
              'dark:border-gray-800 dark:bg-gray-900 dark:text-white',
            )}
          >
            <Mail className="h-5 w-5 text-gray-400" />
            <input
              type="email"
              inputMode="email"
              placeholder="you@company.com"
              className="w-full bg-transparent text-base outline-none"
              {...register('email')}
            />
          </div>
          {formState.errors.email && <p className="text-sm text-red-500">{formState.errors.email.message}</p>}
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-button bg-safety-blue px-4 py-3 font-semibold text-white shadow-card transition hover:bg-safety-blue-600 disabled:opacity-60"
        >
          {loading ? 'Sending magic link…' : 'Send magic link'}
        </button>
      </form>

      {submitted && !error && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-emerald-900/40 dark:text-green-200">
          Check your inbox for the link. It expires in 10 minutes.
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <BiometricAuth onSuccess={() => triggerHaptic('success')} />

      {canInstall && !isInstalled && (
        <button
          type="button"
          onClick={install}
          className="flex w-full items-center justify-center gap-2 rounded-button border border-gray-200 bg-white px-4 py-3 text-sm font-medium shadow-sm transition hover:border-safety-blue hover:text-safety-blue dark:border-gray-800 dark:bg-gray-900"
        >
          <Smartphone className="h-5 w-5" />
          Install the PWA for a better experience
        </button>
      )}
    </div>
  )
}

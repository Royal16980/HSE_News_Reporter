'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { triggerHaptic } from '@/lib/haptics'

type BiometricAuthProps = {
  onSuccess?: () => void
}

export function BiometricAuth({ onSuccess }: BiometricAuthProps) {
  const [supported, setSupported] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const enabled = process.env.NEXT_PUBLIC_ENABLE_BIOMETRIC_AUTH === 'true'
    const isSupported = typeof PublicKeyCredential !== 'undefined'
    setSupported(enabled && isSupported)
  }, [])

  const handleBiometric = async () => {
    if (!supported) return

    try {
      setLoading(true)
      const fakeChallenge = new Uint8Array(32)

      await navigator.credentials.get({
        publicKey: {
          challenge: fakeChallenge,
          timeout: 30_000,
          userVerification: 'preferred',
          allowCredentials: [],
        },
      })

      triggerHaptic('success')
      onSuccess?.()
    } catch (error) {
      console.error('Biometric auth failed', error)
      triggerHaptic('error')
    } finally {
      setLoading(false)
    }
  }

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={handleBiometric}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-button bg-gray-900 px-4 py-3 text-white transition hover:bg-gray-800 disabled:opacity-50"
    >
      <ShieldCheck className="h-5 w-5" />
      {loading ? 'Waiting for Face/Touch ID…' : 'Use Face/Touch ID'}
    </button>
  )
}

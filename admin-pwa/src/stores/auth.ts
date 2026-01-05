'use client'

import { create } from 'zustand'
import { getSupabaseClient } from '@/lib/supabase'
import type { Session, SupabaseClient, User } from '@supabase/supabase-js'

type AuthState = {
  user: User | null
  session: Session | null
  loading: boolean
  error?: string
  sendMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
  hydrateFromSession: () => Promise<void>
}

function mapSession(session: Session | null) {
  return {
    user: session?.user ?? null,
    session,
  }
}

export const useAuthStore = create<AuthState>((set) => {
  let supabase: SupabaseClient | null = null

  const getClient = () => {
    if (!supabase) supabase = getSupabaseClient()
    return supabase
  }

  return {
    user: null,
    session: null,
    loading: false,
    async sendMagicLink(email: string) {
      set({ loading: true, error: undefined })
      try {
        const client = getClient()
        const { error } = await client.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/review` },
        })

        if (error) {
          set({ error: error.message, loading: false })
        } else {
          set({ loading: false })
        }
      } catch (error: any) {
        set({ error: error.message, loading: false })
      }
    },
    async signOut() {
      set({ loading: true })
      try {
        const client = getClient()
        await client.auth.signOut()
        set({ user: null, session: null, loading: false })
      } catch (error: any) {
        set({ error: error.message, loading: false })
      }
    },
    async hydrateFromSession() {
      set({ loading: true })
      try {
        const client = getClient()
        const {
          data: { session },
        } = await client.auth.getSession()

        set({ ...mapSession(session), loading: false })

        client.auth.onAuthStateChange((_event, newSession) => {
          set({ ...mapSession(newSession), loading: false })
        })
      } catch (error: any) {
        set({ error: error.message, loading: false })
      }
    },
  }
})

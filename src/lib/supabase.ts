import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization to prevent build-time failures when env vars are not yet available.
// During Next.js build page-data collection, modules are imported but env vars may be
// undefined. Wrapping in Proxy defers createClient() until first actual use (request time).

let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

function getSupabaseInstance(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )
  }
  return _supabase
}

function getSupabaseAdminInstance(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
  }
  return _supabaseAdmin
}

// Proxy-based lazy clients — existing imports need no changes
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    return (getSupabaseInstance() as any)[prop]
  },
})

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    return (getSupabaseAdminInstance() as any)[prop]
  },
})

import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for Client Components.
 * This should be used in hooks or components that run in the browser.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

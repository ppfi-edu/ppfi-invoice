import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/types"

export function createClient() {
  return createBrowserClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  )
}

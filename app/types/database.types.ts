/**
 * Supabase database types.
 * Generate from your project: npx supabase gen types typescript --project-id "$PROJECT_REF" > app/types/database.types.ts
 * Or for local: npx supabase gen types typescript --local > app/types/database.types.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

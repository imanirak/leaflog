export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      plants: {
        Row: {
          id: string
          user_id: string
          name: string
          species: string | null
          room: string | null
          date_acquired: string | null
          notes_count: number
          photos_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          species?: string | null
          room?: string | null
          date_acquired?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          species?: string | null
          room?: string | null
          date_acquired?: string | null
          updated_at?: string
        }
      }
      plant_tags: {
        Row: {
          id: string
          plant_id: string
          user_id: string
          tag: string
          created_at: string
        }
        Insert: {
          id?: string
          plant_id: string
          user_id: string
          tag: string
          created_at?: string
        }
        Update: {
          tag?: string
        }
      }
      photos: {
        Row: {
          id: string
          plant_id: string
          user_id: string
          storage_path: string
          caption: string | null
          taken_at: string
          created_at: string
        }
        Insert: {
          id?: string
          plant_id: string
          user_id: string
          storage_path: string
          caption?: string | null
          taken_at?: string
          created_at?: string
        }
        Update: {
          caption?: string | null
        }
      }
      notes: {
        Row: {
          id: string
          plant_id: string
          user_id: string
          body: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plant_id: string
          user_id: string
          body: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          body?: string
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          name?: string
        }
      }
      plant_collections: {
        Row: {
          plant_id: string
          collection_id: string
        }
        Insert: {
          plant_id: string
          collection_id: string
        }
        Update: Record<string, never>
      }
    }
  }
}

export type Plant = Database['public']['Tables']['plants']['Row']
export type Photo = Database['public']['Tables']['photos']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type PlantTag = Database['public']['Tables']['plant_tags']['Row']
export type Collection = Database['public']['Tables']['collections']['Row']

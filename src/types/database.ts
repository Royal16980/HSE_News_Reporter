/**
 * Database type definitions for Supabase
 * These types are generated based on the database schema
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
    Tables: {
      articles: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string
          category: string
          tags: string[]
          author: string
          published_at: string
          featured_image_url: string | null
          status: 'draft' | 'published' | 'archived'
          views_count: number
          reading_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt: string
          category: string
          tags?: string[]
          author: string
          published_at?: string
          featured_image_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          views_count?: number
          reading_time: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string
          category?: string
          tags?: string[]
          author?: string
          published_at?: string
          featured_image_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          views_count?: number
          reading_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          color: string
          icon: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          color: string
          icon: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          color?: string
          icon?: string
          description?: string | null
          created_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string
          verified: boolean
          verification_token: string | null
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
          verified?: boolean
          verification_token?: string | null
        }
        Update: {
          id?: string
          email?: string
          subscribed_at?: string
          verified?: boolean
          verification_token?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Article = Database['public']['Tables']['articles']['Row']
export type ArticleInsert = Database['public']['Tables']['articles']['Insert']
export type ArticleUpdate = Database['public']['Tables']['articles']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row']
export type NewsletterSubscriberInsert = Database['public']['Tables']['newsletter_subscribers']['Insert']

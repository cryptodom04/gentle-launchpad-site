export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          message: string
          sender_type: string
          telegram_message_id: number | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          message: string
          sender_type: string
          telegram_message_id?: number | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          message?: string
          sender_type?: string
          telegram_message_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          session_token: string
          updated_at: string
          visitor_country: string | null
          visitor_country_code: string | null
          visitor_email: string
          visitor_ip: string | null
          visitor_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_token?: string
          updated_at?: string
          visitor_country?: string | null
          visitor_country_code?: string | null
          visitor_email: string
          visitor_ip?: string | null
          visitor_name: string
        }
        Update: {
          created_at?: string
          id?: string
          session_token?: string
          updated_at?: string
          visitor_country?: string | null
          visitor_country_code?: string | null
          visitor_email?: string
          visitor_ip?: string | null
          visitor_name?: string
        }
        Relationships: []
      }
      processed_transactions: {
        Row: {
          id: string
          processed_at: string
          signature: string
        }
        Insert: {
          id?: string
          processed_at?: string
          signature: string
        }
        Update: {
          id?: string
          processed_at?: string
          signature?: string
        }
        Relationships: []
      }
      profits: {
        Row: {
          admin_share_sol: number
          amount_sol: number
          amount_usd: number | null
          created_at: string
          domain_id: string
          id: string
          sender_address: string
          tx_signature: string
          worker_id: string
          worker_share_sol: number
        }
        Insert: {
          admin_share_sol: number
          amount_sol: number
          amount_usd?: number | null
          created_at?: string
          domain_id: string
          id?: string
          sender_address: string
          tx_signature: string
          worker_id: string
          worker_share_sol: number
        }
        Update: {
          admin_share_sol?: number
          amount_sol?: number
          amount_usd?: number | null
          created_at?: string
          domain_id?: string
          id?: string
          sender_address?: string
          tx_signature?: string
          worker_id?: string
          worker_share_sol?: number
        }
        Relationships: [
          {
            foreignKeyName: "profits_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "worker_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profits_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          amount_sol: number
          created_at: string
          id: string
          processed_at: string | null
          processed_by: number | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          tx_signature: string | null
          wallet_address: string
          worker_id: string
        }
        Insert: {
          amount_sol: number
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: number | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          tx_signature?: string | null
          wallet_address: string
          worker_id: string
        }
        Update: {
          amount_sol?: number
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: number | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          tx_signature?: string | null
          wallet_address?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_domains: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          subdomain: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          subdomain: string
          worker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          subdomain?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_domains_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          approved_at: string | null
          approved_by: number | null
          balance_sol: number
          created_at: string
          experience: string | null
          hours_per_day: string | null
          id: string
          registration_step: string | null
          status: Database["public"]["Enums"]["worker_status"]
          telegram_id: number
          telegram_name: string | null
          telegram_username: string | null
          traffic_type: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: number | null
          balance_sol?: number
          created_at?: string
          experience?: string | null
          hours_per_day?: string | null
          id?: string
          registration_step?: string | null
          status?: Database["public"]["Enums"]["worker_status"]
          telegram_id: number
          telegram_name?: string | null
          telegram_username?: string | null
          traffic_type?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: number | null
          balance_sol?: number
          created_at?: string
          experience?: string | null
          hours_per_day?: string | null
          id?: string
          registration_step?: string | null
          status?: Database["public"]["Enums"]["worker_status"]
          telegram_id?: number
          telegram_name?: string | null
          telegram_username?: string | null
          traffic_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_transactions: { Args: never; Returns: undefined }
    }
    Enums: {
      withdrawal_status: "pending" | "approved" | "rejected" | "paid"
      worker_status: "pending" | "approved" | "banned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      withdrawal_status: ["pending", "approved", "rejected", "paid"],
      worker_status: ["pending", "approved", "banned"],
    },
  },
} as const

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string
          id: string
          next_action: string | null
          notes: string | null
          opportunity_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          id?: string
          next_action?: string | null
          notes?: string | null
          opportunity_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          id?: string
          next_action?: string | null
          notes?: string | null
          opportunity_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          application_process: string | null
          apply_url: string | null
          benefits: string | null
          category: string
          created_at: string
          deadline: string | null
          description: string
          education_requirement: string | null
          eligibility: string | null
          experience_level: string
          id: string
          is_demo: boolean
          is_premium: boolean
          is_published: boolean
          location: string
          organization: string
          required_skills: string[]
          tags: string[]
          title: string
          views: number
          work_mode: string
        }
        Insert: {
          application_process?: string | null
          apply_url?: string | null
          benefits?: string | null
          category: string
          created_at?: string
          deadline?: string | null
          description: string
          education_requirement?: string | null
          eligibility?: string | null
          experience_level?: string
          id?: string
          is_demo?: boolean
          is_premium?: boolean
          is_published?: boolean
          location?: string
          organization: string
          required_skills?: string[]
          tags?: string[]
          title: string
          views?: number
          work_mode?: string
        }
        Update: {
          application_process?: string | null
          apply_url?: string | null
          benefits?: string | null
          category?: string
          created_at?: string
          deadline?: string | null
          description?: string
          education_requirement?: string | null
          eligibility?: string | null
          experience_level?: string
          id?: string
          is_demo?: boolean
          is_premium?: boolean
          is_published?: boolean
          location?: string
          organization?: string
          required_skills?: string[]
          tags?: string[]
          title?: string
          views?: number
          work_mode?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievements: string | null
          avatar_url: string | null
          branch: string | null
          cgpa: string | null
          city: string | null
          college: string | null
          country: string | null
          created_at: string
          current_year: string | null
          degree: string | null
          experience_level: string | null
          full_name: string | null
          graduation_year: string | null
          id: string
          interests: string[]
          notify_deadlines: boolean
          notify_email: boolean
          onboarding_completed: boolean
          plan: string
          preferred_industry: string | null
          preferred_types: string[]
          profile_public: boolean
          projects: string | null
          resume_name: string | null
          resume_url: string | null
          skills: string[]
          target_role: string | null
          updated_at: string
          work_mode: string | null
        }
        Insert: {
          achievements?: string | null
          avatar_url?: string | null
          branch?: string | null
          cgpa?: string | null
          city?: string | null
          college?: string | null
          country?: string | null
          created_at?: string
          current_year?: string | null
          degree?: string | null
          experience_level?: string | null
          full_name?: string | null
          graduation_year?: string | null
          id: string
          interests?: string[]
          notify_deadlines?: boolean
          notify_email?: boolean
          onboarding_completed?: boolean
          plan?: string
          preferred_industry?: string | null
          preferred_types?: string[]
          profile_public?: boolean
          projects?: string | null
          resume_name?: string | null
          resume_url?: string | null
          skills?: string[]
          target_role?: string | null
          updated_at?: string
          work_mode?: string | null
        }
        Update: {
          achievements?: string | null
          avatar_url?: string | null
          branch?: string | null
          cgpa?: string | null
          city?: string | null
          college?: string | null
          country?: string | null
          created_at?: string
          current_year?: string | null
          degree?: string | null
          experience_level?: string | null
          full_name?: string | null
          graduation_year?: string | null
          id?: string
          interests?: string[]
          notify_deadlines?: boolean
          notify_email?: boolean
          onboarding_completed?: boolean
          plan?: string
          preferred_industry?: string | null
          preferred_types?: string[]
          profile_public?: boolean
          projects?: string | null
          resume_name?: string | null
          resume_url?: string | null
          skills?: string[]
          target_role?: string | null
          updated_at?: string
          work_mode?: string | null
        }
        Relationships: []
      }
      saved_opportunities: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "student"],
    },
  },
} as const

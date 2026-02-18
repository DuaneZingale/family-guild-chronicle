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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      campaign_steps: {
        Row: {
          assigned_to_character_id: string | null
          campaign_id: string
          character_skill_id: string | null
          family_id: string
          gold_reward: number
          id: string
          name: string
          status: string
          step_order: number
          xp_reward: number
        }
        Insert: {
          assigned_to_character_id?: string | null
          campaign_id: string
          character_skill_id?: string | null
          family_id: string
          gold_reward?: number
          id?: string
          name: string
          status?: string
          step_order: number
          xp_reward?: number
        }
        Update: {
          assigned_to_character_id?: string | null
          campaign_id?: string
          character_skill_id?: string | null
          family_id?: string
          gold_reward?: number
          id?: string
          name?: string
          status?: string
          step_order?: number
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_steps_assigned_to_character_id_fkey"
            columns: ["assigned_to_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_steps_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_steps_character_skill_id_fkey"
            columns: ["character_skill_id"]
            isOneToOne: false
            referencedRelation: "character_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_steps_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          description: string
          family_id: string
          id: string
          name: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string
          family_id: string
          id?: string
          name: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string
          family_id?: string
          id?: string
          name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      character_skills: {
        Row: {
          character_id: string
          created_at: string
          family_id: string
          id: string
          importance: string
          notes: string
          skill_definition_id: string
          status: string
        }
        Insert: {
          character_id: string
          created_at?: string
          family_id: string
          id?: string
          importance?: string
          notes?: string
          skill_definition_id: string
          status?: string
        }
        Update: {
          character_id?: string
          created_at?: string
          family_id?: string
          id?: string
          importance?: string
          notes?: string
          skill_definition_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_skills_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_skills_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_skills_skill_definition_id_fkey"
            columns: ["skill_definition_id"]
            isOneToOne: false
            referencedRelation: "skill_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          avatar_emoji: string
          created_at: string
          family_id: string
          gold: number
          id: string
          is_kid: boolean
          name: string
          role_class: string
        }
        Insert: {
          avatar_emoji?: string
          created_at?: string
          family_id: string
          gold?: number
          id?: string
          is_kid?: boolean
          name: string
          role_class?: string
        }
        Update: {
          avatar_emoji?: string
          created_at?: string
          family_id?: string
          gold?: number
          id?: string
          is_kid?: boolean
          name?: string
          role_class?: string
        }
        Relationships: [
          {
            foreignKeyName: "characters_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_definitions: {
        Row: {
          description: string
          icon: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          description?: string
          icon?: string
          id: string
          name: string
          sort_order?: number
        }
        Update: {
          description?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      families: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      family_invites: {
        Row: {
          created_at: string
          email: string | null
          expires_at: string
          family_id: string
          id: string
          invite_code: string
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          expires_at?: string
          family_id: string
          id?: string
          invite_code: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          expires_at?: string
          family_id?: string
          id?: string
          invite_code?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_invites_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_skill_library: {
        Row: {
          family_id: string
          id: string
          skill_definition_id: string
          status: string
        }
        Insert: {
          family_id: string
          id?: string
          skill_definition_id: string
          status?: string
        }
        Update: {
          family_id?: string
          id?: string
          skill_definition_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_skill_library_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_skill_library_skill_definition_id_fkey"
            columns: ["skill_definition_id"]
            isOneToOne: false
            referencedRelation: "skill_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          journey_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          journey_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          journey_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "journey_items_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          created_at: string
          description: string
          family_id: string
          id: string
          owner_character_id: string | null
          path_id: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          family_id: string
          id?: string
          owner_character_id?: string | null
          path_id?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          family_id?: string
          id?: string
          owner_character_id?: string | null
          path_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "journeys_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journeys_owner_character_id_fkey"
            columns: ["owner_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journeys_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "path_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      kid_pins: {
        Row: {
          character_id: string
          created_at: string
          family_id: string
          id: string
          pin_hash: string
        }
        Insert: {
          character_id: string
          created_at?: string
          family_id: string
          id?: string
          pin_hash: string
        }
        Update: {
          character_id?: string
          created_at?: string
          family_id?: string
          id?: string
          pin_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "kid_pins_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: true
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kid_pins_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          family_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      path_definitions: {
        Row: {
          description: string
          icon: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          description?: string
          icon?: string
          id: string
          name: string
          sort_order?: number
        }
        Update: {
          description?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      quest_instances: {
        Row: {
          completed_at: string | null
          due_date: string
          family_id: string
          id: string
          slot: number
          status: string
          template_id: string
        }
        Insert: {
          completed_at?: string | null
          due_date: string
          family_id: string
          id?: string
          slot?: number
          status?: string
          template_id: string
        }
        Update: {
          completed_at?: string | null
          due_date?: string
          family_id?: string
          id?: string
          slot?: number
          status?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_instances_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "quest_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      quest_logs: {
        Row: {
          character_id: string
          completed_at: string
          due_date: string
          family_id: string
          gold_earned: number
          id: string
          note: string
          quest_id: string
          ritual_block: string | null
          slot: number
          streak_at_completion: number
          xp_earned: number
        }
        Insert: {
          character_id: string
          completed_at?: string
          due_date?: string
          family_id: string
          gold_earned?: number
          id?: string
          note?: string
          quest_id: string
          ritual_block?: string | null
          slot?: number
          streak_at_completion?: number
          xp_earned?: number
        }
        Update: {
          character_id?: string
          completed_at?: string
          due_date?: string
          family_id?: string
          gold_earned?: number
          id?: string
          note?: string
          quest_id?: string
          ritual_block?: string | null
          slot?: number
          streak_at_completion?: number
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "quest_logs_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_logs_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_logs_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "unified_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      quest_templates: {
        Row: {
          active: boolean
          assigned_to_character_id: string | null
          autonomy: string
          character_skill_id: string | null
          created_at: string
          days_of_week: number[]
          due_end: string | null
          due_start: string | null
          family_id: string
          gold_reward: number
          id: string
          importance: string
          interval_days: number | null
          name: string
          notify_if_incomplete: boolean
          recurrence_type: string
          times_per_day: number
          type: string
          xp_reward: number
        }
        Insert: {
          active?: boolean
          assigned_to_character_id?: string | null
          autonomy?: string
          character_skill_id?: string | null
          created_at?: string
          days_of_week?: number[]
          due_end?: string | null
          due_start?: string | null
          family_id: string
          gold_reward?: number
          id?: string
          importance?: string
          interval_days?: number | null
          name: string
          notify_if_incomplete?: boolean
          recurrence_type?: string
          times_per_day?: number
          type?: string
          xp_reward?: number
        }
        Update: {
          active?: boolean
          assigned_to_character_id?: string | null
          autonomy?: string
          character_skill_id?: string | null
          created_at?: string
          days_of_week?: number[]
          due_end?: string | null
          due_start?: string | null
          family_id?: string
          gold_reward?: number
          id?: string
          importance?: string
          interval_days?: number | null
          name?: string
          notify_if_incomplete?: boolean
          recurrence_type?: string
          times_per_day?: number
          type?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "quest_templates_assigned_to_character_id_fkey"
            columns: ["assigned_to_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_templates_character_skill_id_fkey"
            columns: ["character_skill_id"]
            isOneToOne: false
            referencedRelation: "character_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_templates_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_definitions: {
        Row: {
          description: string
          domain_id: string
          id: string
          is_default: boolean
          name: string
          path_id: string | null
          tags: string[]
        }
        Insert: {
          description?: string
          domain_id: string
          id?: string
          is_default?: boolean
          name: string
          path_id?: string | null
          tags?: string[]
        }
        Update: {
          description?: string
          domain_id?: string
          id?: string
          is_default?: boolean
          name?: string
          path_id?: string | null
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "skill_definitions_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domain_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_definitions_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "path_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_quests: {
        Row: {
          active: boolean
          assigned_to_character_id: string | null
          autonomy: string
          campaign_id: string | null
          character_skill_id: string | null
          created_at: string
          days_of_week: number[]
          description: string
          due_end: string | null
          due_start: string | null
          family_id: string
          frequency_type: string | null
          gold_reward: number
          id: string
          importance: string
          interval_days: number | null
          is_suggested: boolean
          last_completed_at: string | null
          name: string
          notify_if_incomplete: boolean
          quest_type: string
          ritual_block: string | null
          source_template_id: string | null
          status: string
          step_order: number | null
          streak_count: number
          times_per_day: number
          xp_reward: number
        }
        Insert: {
          active?: boolean
          assigned_to_character_id?: string | null
          autonomy?: string
          campaign_id?: string | null
          character_skill_id?: string | null
          created_at?: string
          days_of_week?: number[]
          description?: string
          due_end?: string | null
          due_start?: string | null
          family_id: string
          frequency_type?: string | null
          gold_reward?: number
          id?: string
          importance?: string
          interval_days?: number | null
          is_suggested?: boolean
          last_completed_at?: string | null
          name: string
          notify_if_incomplete?: boolean
          quest_type?: string
          ritual_block?: string | null
          source_template_id?: string | null
          status?: string
          step_order?: number | null
          streak_count?: number
          times_per_day?: number
          xp_reward?: number
        }
        Update: {
          active?: boolean
          assigned_to_character_id?: string | null
          autonomy?: string
          campaign_id?: string | null
          character_skill_id?: string | null
          created_at?: string
          days_of_week?: number[]
          description?: string
          due_end?: string | null
          due_start?: string | null
          family_id?: string
          frequency_type?: string | null
          gold_reward?: number
          id?: string
          importance?: string
          interval_days?: number | null
          is_suggested?: boolean
          last_completed_at?: string | null
          name?: string
          notify_if_incomplete?: boolean
          quest_type?: string
          ritual_block?: string | null
          source_template_id?: string | null
          status?: string
          step_order?: number | null
          streak_count?: number
          times_per_day?: number
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "unified_quests_assigned_to_character_id_fkey"
            columns: ["assigned_to_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_quests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_quests_character_skill_id_fkey"
            columns: ["character_skill_id"]
            isOneToOne: false
            referencedRelation: "character_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_quests_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      user_character_links: {
        Row: {
          character_id: string
          created_at: string
          family_id: string
          id: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          family_id: string
          id?: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          family_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_character_links_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_character_links_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_events: {
        Row: {
          character_id: string
          character_skill_id: string | null
          family_id: string
          gold: number
          id: string
          note: string
          source: string
          ts: string
          xp: number
        }
        Insert: {
          character_id: string
          character_skill_id?: string | null
          family_id: string
          gold?: number
          id?: string
          note?: string
          source: string
          ts?: string
          xp?: number
        }
        Update: {
          character_id?: string
          character_skill_id?: string | null
          family_id?: string
          gold?: number
          id?: string
          note?: string
          source?: string
          ts?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_events_character_skill_id_fkey"
            columns: ["character_skill_id"]
            isOneToOne: false
            referencedRelation: "character_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_campaign_step: {
        Args: { p_family_id: string; p_step_id: string }
        Returns: undefined
      }
      complete_quest: {
        Args: { p_family_id: string; p_instance_id: string }
        Returns: undefined
      }
      create_family_with_setup: {
        Args: {
          p_avatar_emoji?: string
          p_character_name: string
          p_family_name: string
          p_role_class?: string
          p_user_id: string
        }
        Returns: Json
      }
      generate_daily_quests: {
        Args: { p_date?: string; p_family_id: string }
        Returns: undefined
      }
      is_family_member: { Args: { p_family_id: string }; Returns: boolean }
      is_family_parent: { Args: { p_family_id: string }; Returns: boolean }
      seed_family_skills: { Args: { p_family_id: string }; Returns: undefined }
      set_kid_pin: {
        Args: { p_character_id: string; p_family_id: string; p_pin: string }
        Returns: undefined
      }
      verify_kid_pin: {
        Args: { p_character_id: string; p_pin: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

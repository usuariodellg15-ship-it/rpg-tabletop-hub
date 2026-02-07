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
      campaign_allowed_items: {
        Row: {
          campaign_id: string
          enabled_at: string
          id: string
          item_id: string
          item_type: string
        }
        Insert: {
          campaign_id: string
          enabled_at?: string
          id?: string
          item_id: string
          item_type: string
        }
        Update: {
          campaign_id?: string
          enabled_at?: string
          id?: string
          item_id?: string
          item_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_allowed_items_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_homebrews: {
        Row: {
          campaign_id: string
          enabled_at: string
          homebrew_id: string
          id: string
        }
        Insert: {
          campaign_id: string
          enabled_at?: string
          homebrew_id: string
          id?: string
        }
        Update: {
          campaign_id?: string
          enabled_at?: string
          homebrew_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_homebrews_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_homebrews_homebrew_id_fkey"
            columns: ["homebrew_id"]
            isOneToOne: false
            referencedRelation: "homebrews"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_memberships: {
        Row: {
          campaign_id: string
          id: string
          requested_at: string
          responded_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["membership_status"]
          user_id: string
        }
        Insert: {
          campaign_id: string
          id?: string
          requested_at?: string
          responded_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          user_id: string
        }
        Update: {
          campaign_id?: string
          id?: string
          requested_at?: string
          responded_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_memberships_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          description: string | null
          gm_id: string
          id: string
          invite_code: string | null
          is_active: boolean | null
          max_players: number | null
          name: string
          system: Database["public"]["Enums"]["system_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          gm_id: string
          id?: string
          invite_code?: string | null
          is_active?: boolean | null
          max_players?: number | null
          name: string
          system?: Database["public"]["Enums"]["system_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          gm_id?: string
          id?: string
          invite_code?: string | null
          is_active?: boolean | null
          max_players?: number | null
          name?: string
          system?: Database["public"]["Enums"]["system_type"]
          updated_at?: string
        }
        Relationships: []
      }
      character_abilities: {
        Row: {
          ability_id: string | null
          character_id: string
          created_at: string
          custom_description: string | null
          custom_name: string | null
          homebrew_id: string | null
          id: string
          level_acquired: number
        }
        Insert: {
          ability_id?: string | null
          character_id: string
          created_at?: string
          custom_description?: string | null
          custom_name?: string | null
          homebrew_id?: string | null
          id?: string
          level_acquired?: number
        }
        Update: {
          ability_id?: string | null
          character_id?: string
          created_at?: string
          custom_description?: string | null
          custom_name?: string | null
          homebrew_id?: string | null
          id?: string
          level_acquired?: number
        }
        Relationships: [
          {
            foreignKeyName: "character_abilities_ability_id_fkey"
            columns: ["ability_id"]
            isOneToOne: false
            referencedRelation: "system_abilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_abilities_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_abilities_homebrew_id_fkey"
            columns: ["homebrew_id"]
            isOneToOne: false
            referencedRelation: "homebrews"
            referencedColumns: ["id"]
          },
        ]
      }
      character_custom_rolls: {
        Row: {
          character_id: string
          created_at: string
          description: string | null
          formula: string
          id: string
          name: string
          roll_type: string
        }
        Insert: {
          character_id: string
          created_at?: string
          description?: string | null
          formula: string
          id?: string
          name: string
          roll_type?: string
        }
        Update: {
          character_id?: string
          created_at?: string
          description?: string | null
          formula?: string
          id?: string
          name?: string
          roll_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_custom_rolls_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_inventory: {
        Row: {
          character_id: string
          created_at: string
          data: Json | null
          homebrew_id: string | null
          id: string
          item_id: string | null
          name: string
          quantity: number | null
          weight: number | null
        }
        Insert: {
          character_id: string
          created_at?: string
          data?: Json | null
          homebrew_id?: string | null
          id?: string
          item_id?: string | null
          name: string
          quantity?: number | null
          weight?: number | null
        }
        Update: {
          character_id?: string
          created_at?: string
          data?: Json | null
          homebrew_id?: string | null
          id?: string
          item_id?: string | null
          name?: string
          quantity?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "character_inventory_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_inventory_homebrew_id_fkey"
            columns: ["homebrew_id"]
            isOneToOne: false
            referencedRelation: "homebrews"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          ac: number | null
          attributes: Json | null
          campaign_id: string
          class: string | null
          class_id: string | null
          created_at: string
          hp_current: number | null
          hp_max: number | null
          id: string
          level: number | null
          name: string
          notes: string | null
          skills: Json | null
          specialization_id: string | null
          updated_at: string
          user_id: string
          weight_current: number | null
          weight_max: number | null
        }
        Insert: {
          ac?: number | null
          attributes?: Json | null
          campaign_id: string
          class?: string | null
          class_id?: string | null
          created_at?: string
          hp_current?: number | null
          hp_max?: number | null
          id?: string
          level?: number | null
          name: string
          notes?: string | null
          skills?: Json | null
          specialization_id?: string | null
          updated_at?: string
          user_id: string
          weight_current?: number | null
          weight_max?: number | null
        }
        Update: {
          ac?: number | null
          attributes?: Json | null
          campaign_id?: string
          class?: string | null
          class_id?: string | null
          created_at?: string
          hp_current?: number | null
          hp_max?: number | null
          id?: string
          level?: number | null
          name?: string
          notes?: string | null
          skills?: Json | null
          specialization_id?: string | null
          updated_at?: string
          user_id?: string
          weight_current?: number | null
          weight_max?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "characters_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "characters_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "system_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "characters_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "system_specializations"
            referencedColumns: ["id"]
          },
        ]
      }
      combat_encounters: {
        Row: {
          campaign_id: string
          created_at: string
          current_turn: number | null
          id: string
          is_active: boolean | null
          name: string | null
          round_number: number | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          current_turn?: number | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          round_number?: number | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          current_turn?: number | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          round_number?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "combat_encounters_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      combat_stat_events: {
        Row: {
          amount: number
          campaign_id: string
          character_id: string
          created_at: string
          event_type: string
          id: string
          related_roll_id: string | null
        }
        Insert: {
          amount: number
          campaign_id: string
          character_id: string
          created_at?: string
          event_type: string
          id?: string
          related_roll_id?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string
          character_id?: string
          created_at?: string
          event_type?: string
          id?: string
          related_roll_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "combat_stat_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_stat_events_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_stat_events_related_roll_id_fkey"
            columns: ["related_roll_id"]
            isOneToOne: false
            referencedRelation: "dice_rolls"
            referencedColumns: ["id"]
          },
        ]
      }
      dice_rolls: {
        Row: {
          campaign_id: string
          character_id: string | null
          created_at: string
          details: string | null
          formula: string
          id: string
          result: number
          roll_type: string | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          character_id?: string | null
          created_at?: string
          details?: string | null
          formula: string
          id?: string
          result: number
          roll_type?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          character_id?: string | null
          created_at?: string
          details?: string | null
          formula?: string
          id?: string
          result?: number
          roll_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dice_rolls_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dice_rolls_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      encounter_entries: {
        Row: {
          character_id: string | null
          created_at: string
          creature_id: string | null
          custom_name: string | null
          encounter_id: string
          hp_current: number | null
          hp_max: number | null
          id: string
          initiative: number
          is_player: boolean | null
          sort_order: number | null
        }
        Insert: {
          character_id?: string | null
          created_at?: string
          creature_id?: string | null
          custom_name?: string | null
          encounter_id: string
          hp_current?: number | null
          hp_max?: number | null
          id?: string
          initiative?: number
          is_player?: boolean | null
          sort_order?: number | null
        }
        Update: {
          character_id?: string | null
          created_at?: string
          creature_id?: string | null
          custom_name?: string | null
          encounter_id?: string
          hp_current?: number | null
          hp_max?: number | null
          id?: string
          initiative?: number
          is_player?: boolean | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "encounter_entries_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounter_entries_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "combat_encounters"
            referencedColumns: ["id"]
          },
        ]
      }
      gm_notes: {
        Row: {
          campaign_id: string
          content: string
          created_at: string
          id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          content: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          content?: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gm_notes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      homebrews: {
        Row: {
          created_at: string
          creator_id: string
          data: Json | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          rarity: string | null
          system: Database["public"]["Enums"]["system_type"]
          type: Database["public"]["Enums"]["homebrew_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          data?: Json | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          rarity?: string | null
          system?: Database["public"]["Enums"]["system_type"]
          type?: Database["public"]["Enums"]["homebrew_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          data?: Json | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          rarity?: string | null
          system?: Database["public"]["Enums"]["system_type"]
          type?: Database["public"]["Enums"]["homebrew_type"]
          updated_at?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          campaign_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          objectives: Json | null
          rewards: string | null
          status: Database["public"]["Enums"]["mission_status"]
          title: string
        }
        Insert: {
          campaign_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          objectives?: Json | null
          rewards?: string | null
          status?: Database["public"]["Enums"]["mission_status"]
          title: string
        }
        Update: {
          campaign_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          objectives?: Json | null
          rewards?: string | null
          status?: Database["public"]["Enums"]["mission_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_abilities: {
        Row: {
          class_id: string | null
          created_at: string
          description: string | null
          id: string
          level_required: number
          name: string
          specialization_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          level_required?: number
          name: string
          specialization_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          level_required?: number
          name?: string
          specialization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_abilities_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "system_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_abilities_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "system_specializations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_classes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          system: Database["public"]["Enums"]["system_type"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          system: Database["public"]["Enums"]["system_type"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          system?: Database["public"]["Enums"]["system_type"]
        }
        Relationships: []
      }
      system_specializations: {
        Row: {
          class_id: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_specializations_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "system_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          campaign_id: string
          created_at: string
          description: string | null
          event_date: string | null
          event_type: string | null
          id: string
          title: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          title: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      safe_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string | null
          name: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_campaign_by_invite_code: {
        Args: { _code: string }
        Returns: {
          created_at: string
          description: string
          gm_id: string
          id: string
          is_active: boolean
          max_players: number
          name: string
          system: Database["public"]["Enums"]["system_type"]
        }[]
      }
      get_public_campaigns: {
        Args: never
        Returns: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          max_players: number
          name: string
          system: Database["public"]["Enums"]["system_type"]
        }[]
      }
      has_campaign_access: { Args: { campaign_uuid: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_campaign_gm: { Args: { campaign_uuid: string }; Returns: boolean }
      is_campaign_member: { Args: { campaign_uuid: string }; Returns: boolean }
      is_same_campaign_member: {
        Args: { target_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      homebrew_type: "item" | "creature" | "spell" | "class" | "race"
      membership_status: "pending" | "approved" | "rejected"
      mission_status: "active" | "completed"
      subscription_plan: "free" | "premium"
      system_type: "5e" | "olho_da_morte" | "horror"
      user_role: "gm" | "player" | "admin"
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
      homebrew_type: ["item", "creature", "spell", "class", "race"],
      membership_status: ["pending", "approved", "rejected"],
      mission_status: ["active", "completed"],
      subscription_plan: ["free", "premium"],
      system_type: ["5e", "olho_da_morte", "horror"],
      user_role: ["gm", "player", "admin"],
    },
  },
} as const

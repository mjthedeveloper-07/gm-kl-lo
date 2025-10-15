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
      lottery_results: {
        Row: {
          created_at: string | null
          date: string
          draw_number: string
          id: string
          lottery_name: string
          lottery_type: string | null
          month: number
          result: string
          year: number
        }
        Insert: {
          created_at?: string | null
          date: string
          draw_number: string
          id?: string
          lottery_name: string
          lottery_type?: string | null
          month: number
          result: string
          year: number
        }
        Update: {
          created_at?: string | null
          date?: string
          draw_number?: string
          id?: string
          lottery_name?: string
          lottery_type?: string | null
          month?: number
          result?: string
          year?: number
        }
        Relationships: []
      }
      method_performance: {
        Row: {
          avg_matching_digits: number | null
          confidence_score: number | null
          exact_matches: number | null
          id: string
          last_3_matches: number | null
          last_4_matches: number | null
          last_updated: string
          metadata: Json | null
          method_name: string
          total_predictions: number | null
        }
        Insert: {
          avg_matching_digits?: number | null
          confidence_score?: number | null
          exact_matches?: number | null
          id?: string
          last_3_matches?: number | null
          last_4_matches?: number | null
          last_updated?: string
          metadata?: Json | null
          method_name: string
          total_predictions?: number | null
        }
        Update: {
          avg_matching_digits?: number | null
          confidence_score?: number | null
          exact_matches?: number | null
          id?: string
          last_3_matches?: number | null
          last_4_matches?: number | null
          last_updated?: string
          metadata?: Json | null
          method_name?: string
          total_predictions?: number | null
        }
        Relationships: []
      }
      prediction_accuracy: {
        Row: {
          actual_result_id: string | null
          created_at: string
          exact_match: boolean | null
          id: string
          last_3_match: boolean | null
          last_4_match: boolean | null
          match_positions: number[] | null
          matching_digits: number | null
          prediction_id: string | null
        }
        Insert: {
          actual_result_id?: string | null
          created_at?: string
          exact_match?: boolean | null
          id?: string
          last_3_match?: boolean | null
          last_4_match?: boolean | null
          match_positions?: number[] | null
          matching_digits?: number | null
          prediction_id?: string | null
        }
        Update: {
          actual_result_id?: string | null
          created_at?: string
          exact_match?: boolean | null
          id?: string
          last_3_match?: boolean | null
          last_4_match?: boolean | null
          match_positions?: number[] | null
          matching_digits?: number | null
          prediction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prediction_accuracy_actual_result_id_fkey"
            columns: ["actual_result_id"]
            isOneToOne: false
            referencedRelation: "lottery_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_accuracy_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "prediction_history"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_history: {
        Row: {
          confidence_level: Database["public"]["Enums"]["confidence_level"]
          created_at: string
          id: string
          lottery_type: string | null
          metadata: Json | null
          method_name: string
          predicted_numbers: string[]
        }
        Insert: {
          confidence_level?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          id?: string
          lottery_type?: string | null
          metadata?: Json | null
          method_name: string
          predicted_numbers: string[]
        }
        Update: {
          confidence_level?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          id?: string
          lottery_type?: string | null
          metadata?: Json | null
          method_name?: string
          predicted_numbers?: string[]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      confidence_level: "very_low" | "low" | "medium" | "high" | "very_high"
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
      confidence_level: ["very_low", "low", "medium", "high", "very_high"],
    },
  },
} as const

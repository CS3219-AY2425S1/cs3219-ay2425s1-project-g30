export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      question_bank: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          q_category: Database["public"]["Enums"]["Category"][]
          q_complexity: Database["public"]["Enums"]["Complexity"]
          q_desc: string | null
          q_title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          q_category: Database["public"]["Enums"]["Category"][]
          q_complexity: Database["public"]["Enums"]["Complexity"]
          q_desc?: string | null
          q_title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          q_category?: Database["public"]["Enums"]["Category"][]
          q_complexity?: Database["public"]["Enums"]["Complexity"]
          q_desc?: string | null
          q_title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      test_cases: {
        Row: {
          cases: Json
          created_at: string | null
          id: string
          question_id: string
          schema: Json
          updated_at: string | null
        }
        Insert: {
          cases: Json
          created_at?: string | null
          id?: string
          question_id: string
          schema: Json
          updated_at?: string | null
        }
        Update: {
          cases?: Json
          created_at?: string | null
          id?: string
          question_id?: string
          schema?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_cases_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_cases_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "random_question"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      random_question: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string | null
          q_category: Database["public"]["Enums"]["Category"][] | null
          q_complexity: Database["public"]["Enums"]["Complexity"] | null
          q_desc: string | null
          q_title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          q_category?: Database["public"]["Enums"]["Category"][] | null
          q_complexity?: Database["public"]["Enums"]["Complexity"] | null
          q_desc?: string | null
          q_title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          q_category?: Database["public"]["Enums"]["Category"][] | null
          q_complexity?: Database["public"]["Enums"]["Complexity"] | null
          q_desc?: string | null
          q_title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      Category:
        | "Strings"
        | "Algorithms"
        | "Data Structures"
        | "Bit Manipulation"
        | "Recursion"
        | "Databases"
        | "Brain Teaser"
        | "Arrays"
      Complexity: "Easy" | "Medium" | "Hard"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

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
      encounters: {
        Row: {
          chief_complaint: string | null
          clinician_id: string | null
          created_at: string
          diagnosis: string | null
          diagnosis_codes: Json | null
          encounter_date: string
          encounter_type: Database["public"]["Enums"]["encounter_type"]
          examination_notes: string | null
          facility_id: string | null
          id: string
          is_syndromic_alert: boolean
          patient_id: string
          prescriptions: Json | null
          referral_notes: string | null
          symptoms: Json | null
          syndromic_flags: Json | null
          treatment_plan: string | null
          updated_at: string
          vital_signs: Json | null
        }
        Insert: {
          chief_complaint?: string | null
          clinician_id?: string | null
          created_at?: string
          diagnosis?: string | null
          diagnosis_codes?: Json | null
          encounter_date?: string
          encounter_type?: Database["public"]["Enums"]["encounter_type"]
          examination_notes?: string | null
          facility_id?: string | null
          id?: string
          is_syndromic_alert?: boolean
          patient_id: string
          prescriptions?: Json | null
          referral_notes?: string | null
          symptoms?: Json | null
          syndromic_flags?: Json | null
          treatment_plan?: string | null
          updated_at?: string
          vital_signs?: Json | null
        }
        Update: {
          chief_complaint?: string | null
          clinician_id?: string | null
          created_at?: string
          diagnosis?: string | null
          diagnosis_codes?: Json | null
          encounter_date?: string
          encounter_type?: Database["public"]["Enums"]["encounter_type"]
          examination_notes?: string | null
          facility_id?: string | null
          id?: string
          is_syndromic_alert?: boolean
          patient_id?: string
          prescriptions?: Json | null
          referral_notes?: string | null
          symptoms?: Json | null
          syndromic_flags?: Json | null
          treatment_plan?: string | null
          updated_at?: string
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "encounters_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          address: string | null
          bed_count: number | null
          created_at: string
          district: string | null
          email: string | null
          facility_code: string | null
          facility_type: Database["public"]["Enums"]["facility_type"]
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          region: string | null
          status: Database["public"]["Enums"]["facility_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          bed_count?: number | null
          created_at?: string
          district?: string | null
          email?: string | null
          facility_code?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"]
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          region?: string | null
          status?: Database["public"]["Enums"]["facility_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          bed_count?: number | null
          created_at?: string
          district?: string | null
          email?: string | null
          facility_code?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"]
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          region?: string | null
          status?: Database["public"]["Enums"]["facility_status"]
          updated_at?: string
        }
        Relationships: []
      }
      immunizations: {
        Row: {
          administered_at: string
          administered_by: string | null
          batch_number: string | null
          created_at: string
          dose_number: number
          facility_id: string | null
          id: string
          next_dose_date: string | null
          notes: string | null
          patient_id: string
          vaccine_name: string
        }
        Insert: {
          administered_at?: string
          administered_by?: string | null
          batch_number?: string | null
          created_at?: string
          dose_number?: number
          facility_id?: string | null
          id?: string
          next_dose_date?: string | null
          notes?: string | null
          patient_id: string
          vaccine_name: string
        }
        Update: {
          administered_at?: string
          administered_by?: string | null
          batch_number?: string | null
          created_at?: string
          dose_number?: number
          facility_id?: string | null
          id?: string
          next_dose_date?: string | null
          notes?: string | null
          patient_id?: string
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "immunizations_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "immunizations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          created_at: string
          encounter_id: string | null
          facility_id: string | null
          id: string
          is_abnormal: boolean | null
          notes: string | null
          ordered_at: string
          ordered_by: string | null
          patient_id: string
          performed_by: string | null
          reference_range: string | null
          result: string | null
          result_data: Json | null
          resulted_at: string | null
          test_category: string | null
          test_name: string
        }
        Insert: {
          created_at?: string
          encounter_id?: string | null
          facility_id?: string | null
          id?: string
          is_abnormal?: boolean | null
          notes?: string | null
          ordered_at?: string
          ordered_by?: string | null
          patient_id: string
          performed_by?: string | null
          reference_range?: string | null
          result?: string | null
          result_data?: Json | null
          resulted_at?: string | null
          test_category?: string | null
          test_name: string
        }
        Update: {
          created_at?: string
          encounter_id?: string | null
          facility_id?: string | null
          id?: string
          is_abnormal?: boolean | null
          notes?: string | null
          ordered_at?: string
          ordered_by?: string | null
          patient_id?: string
          performed_by?: string | null
          reference_range?: string | null
          result?: string | null
          result_data?: Json | null
          resulted_at?: string | null
          test_category?: string | null
          test_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          blood_group: string | null
          created_at: string
          date_of_birth: string | null
          facility_id: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          genotype: string | null
          id: string
          last_name: string
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          patient_code: string | null
          phone: string | null
          photo_url: string | null
          registered_by: string | null
          status: Database["public"]["Enums"]["patient_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          blood_group?: string | null
          created_at?: string
          date_of_birth?: string | null
          facility_id?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          genotype?: string | null
          id?: string
          last_name: string
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          patient_code?: string | null
          phone?: string | null
          photo_url?: string | null
          registered_by?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string | null
          blood_group?: string | null
          created_at?: string
          date_of_birth?: string | null
          facility_id?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          genotype?: string | null
          id?: string
          last_name?: string
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          patient_code?: string | null
          phone?: string | null
          photo_url?: string | null
          registered_by?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          facility_id: string | null
          full_name: string
          id: string
          is_active: boolean
          job_title: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          facility_id?: string | null
          full_name?: string
          id: string
          is_active?: boolean
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          facility_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      surveillance_alerts: {
        Row: {
          assigned_to: string | null
          case_count: number
          created_at: string
          description: string | null
          detected_at: string
          disease_name: string
          district: string | null
          facility_id: string | null
          id: string
          notes: string | null
          region: string | null
          reported_by: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          status: Database["public"]["Enums"]["alert_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_count?: number
          created_at?: string
          description?: string | null
          detected_at?: string
          disease_name: string
          district?: string | null
          facility_id?: string | null
          id?: string
          notes?: string | null
          region?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_count?: number
          created_at?: string
          description?: string | null
          detected_at?: string
          disease_name?: string
          district?: string | null
          facility_id?: string | null
          id?: string
          notes?: string | null
          region?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveillance_alerts_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          facility_id: string | null
          granted_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          facility_id?: string | null
          granted_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          facility_id?: string | null
          granted_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_facility_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      alert_severity: "low" | "medium" | "high" | "critical"
      alert_status:
        | "pending"
        | "investigating"
        | "confirmed"
        | "dismissed"
        | "resolved"
      app_role:
        | "super_admin"
        | "facility_admin"
        | "doctor"
        | "nurse"
        | "chew"
        | "lab_tech"
        | "pharmacist"
        | "data_clerk"
        | "epidemiologist"
        | "dsno"
      encounter_type:
        | "consultation"
        | "emergency"
        | "follow_up"
        | "referral"
        | "anc"
        | "immunization"
        | "lab"
      facility_status: "pending" | "active" | "suspended" | "deactivated"
      facility_type:
        | "primary"
        | "secondary"
        | "tertiary"
        | "clinic"
        | "hospital"
      gender_type: "male" | "female" | "other"
      patient_status: "active" | "inactive" | "deceased" | "transferred"
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
      alert_severity: ["low", "medium", "high", "critical"],
      alert_status: [
        "pending",
        "investigating",
        "confirmed",
        "dismissed",
        "resolved",
      ],
      app_role: [
        "super_admin",
        "facility_admin",
        "doctor",
        "nurse",
        "chew",
        "lab_tech",
        "pharmacist",
        "data_clerk",
        "epidemiologist",
        "dsno",
      ],
      encounter_type: [
        "consultation",
        "emergency",
        "follow_up",
        "referral",
        "anc",
        "immunization",
        "lab",
      ],
      facility_status: ["pending", "active", "suspended", "deactivated"],
      facility_type: ["primary", "secondary", "tertiary", "clinic", "hospital"],
      gender_type: ["male", "female", "other"],
      patient_status: ["active", "inactive", "deceased", "transferred"],
    },
  },
} as const

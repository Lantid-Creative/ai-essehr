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
      ambulance_care_log: {
        Row: {
          entry_type: string
          free_text: string | null
          id: string
          payload: Json
          recorded_at: string
          recorded_by: string
          rescue_request_id: string
        }
        Insert: {
          entry_type: string
          free_text?: string | null
          id?: string
          payload?: Json
          recorded_at?: string
          recorded_by: string
          rescue_request_id: string
        }
        Update: {
          entry_type?: string
          free_text?: string | null
          id?: string
          payload?: Json
          recorded_at?: string
          recorded_by?: string
          rescue_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambulance_care_log_rescue_request_id_fkey"
            columns: ["rescue_request_id"]
            isOneToOne: false
            referencedRelation: "rescue_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ambulances: {
        Row: {
          call_sign: string
          capability: string
          created_at: string
          current_crew: string[] | null
          current_lat: number | null
          current_lng: number | null
          facility_id: string
          id: string
          last_ping_at: string | null
          notes: string | null
          plate_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          call_sign: string
          capability?: string
          created_at?: string
          current_crew?: string[] | null
          current_lat?: number | null
          current_lng?: number | null
          facility_id: string
          id?: string
          last_ping_at?: string | null
          notes?: string | null
          plate_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          call_sign?: string
          capability?: string
          created_at?: string
          current_crew?: string[] | null
          current_lat?: number | null
          current_lng?: number | null
          facility_id?: string
          id?: string
          last_ping_at?: string | null
          notes?: string | null
          plate_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          checked_in_at: string | null
          created_at: string
          facility_id: string
          id: string
          notes: string | null
          patient_id: string
          queue_number: number | null
          scheduled_by: string | null
          status: string
          triage_priority: string | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_type?: string
          checked_in_at?: string | null
          created_at?: string
          facility_id: string
          id?: string
          notes?: string | null
          patient_id: string
          queue_number?: number | null
          scheduled_by?: string | null
          status?: string
          triage_priority?: string | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string
          checked_in_at?: string | null
          created_at?: string
          facility_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          queue_number?: number | null
          scheduled_by?: string | null
          status?: string
          triage_priority?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          facility_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          facility_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          facility_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_announcements: {
        Row: {
          active: boolean
          body: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          severity: string
          target_role: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          severity?: string
          target_role?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          severity?: string
          target_role?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      case_report_dispatches: {
        Row: {
          acknowledged_at: string | null
          case_report_id: string
          created_at: string
          dispatched_at: string | null
          external_id: string | null
          id: string
          last_error: string | null
          max_retries: number
          next_retry_at: string | null
          payload: Json
          response: Json | null
          retry_count: number
          status: string
          target: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          case_report_id: string
          created_at?: string
          dispatched_at?: string | null
          external_id?: string | null
          id?: string
          last_error?: string | null
          max_retries?: number
          next_retry_at?: string | null
          payload: Json
          response?: Json | null
          retry_count?: number
          status?: string
          target: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          case_report_id?: string
          created_at?: string
          dispatched_at?: string | null
          external_id?: string | null
          id?: string
          last_error?: string | null
          max_retries?: number
          next_retry_at?: string | null
          payload?: Json
          response?: Json | null
          retry_count?: number
          status?: string
          target?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_report_dispatches_case_report_id_fkey"
            columns: ["case_report_id"]
            isOneToOne: false
            referencedRelation: "case_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      case_reports: {
        Row: {
          case_classification: string
          created_at: string
          created_by: string | null
          disease: string
          encounter_id: string | null
          external_uuid: string
          facility_id: string
          facility_validated_at: string | null
          facility_validated_by: string | null
          id: string
          lga_validated_at: string | null
          lga_validated_by: string | null
          onset_date: string | null
          outcome: string | null
          patient_id: string
          rejection_reason: string | null
          sla_facility_due_at: string | null
          sla_lga_due_at: string | null
          sla_state_due_at: string | null
          state_validated_at: string | null
          state_validated_by: string | null
          status: string
          symptoms: Json
          updated_at: string
        }
        Insert: {
          case_classification?: string
          created_at?: string
          created_by?: string | null
          disease: string
          encounter_id?: string | null
          external_uuid?: string
          facility_id: string
          facility_validated_at?: string | null
          facility_validated_by?: string | null
          id?: string
          lga_validated_at?: string | null
          lga_validated_by?: string | null
          onset_date?: string | null
          outcome?: string | null
          patient_id: string
          rejection_reason?: string | null
          sla_facility_due_at?: string | null
          sla_lga_due_at?: string | null
          sla_state_due_at?: string | null
          state_validated_at?: string | null
          state_validated_by?: string | null
          status?: string
          symptoms?: Json
          updated_at?: string
        }
        Update: {
          case_classification?: string
          created_at?: string
          created_by?: string | null
          disease?: string
          encounter_id?: string | null
          external_uuid?: string
          facility_id?: string
          facility_validated_at?: string | null
          facility_validated_by?: string | null
          id?: string
          lga_validated_at?: string | null
          lga_validated_by?: string | null
          onset_date?: string | null
          outcome?: string | null
          patient_id?: string
          rejection_reason?: string | null
          sla_facility_due_at?: string | null
          sla_lga_due_at?: string | null
          sla_state_due_at?: string | null
          state_validated_at?: string | null
          state_validated_by?: string | null
          status?: string
          symptoms?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_reports_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_reports_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      drug_inventory: {
        Row: {
          batch_number: string | null
          category: string | null
          created_at: string
          drug_name: string
          expiry_date: string | null
          facility_id: string
          generic_name: string | null
          id: string
          last_restocked_at: string | null
          quantity_in_stock: number
          reorder_level: number
          supplier: string | null
          unit: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          category?: string | null
          created_at?: string
          drug_name: string
          expiry_date?: string | null
          facility_id: string
          generic_name?: string | null
          id?: string
          last_restocked_at?: string | null
          quantity_in_stock?: number
          reorder_level?: number
          supplier?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          category?: string | null
          created_at?: string
          drug_name?: string
          expiry_date?: string | null
          facility_id?: string
          generic_name?: string | null
          id?: string
          last_restocked_at?: string | null
          quantity_in_stock?: number
          reorder_level?: number
          supplier?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drug_inventory_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      encounters: {
        Row: {
          case_classification: string | null
          chief_complaint: string | null
          clinician_id: string | null
          created_at: string
          diagnosis: string | null
          diagnosis_codes: Json | null
          dispensed_at: string | null
          dispensed_by: string | null
          encounter_date: string
          encounter_type: Database["public"]["Enums"]["encounter_type"]
          examination_notes: string | null
          facility_id: string | null
          icd10_code: string | null
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
          case_classification?: string | null
          chief_complaint?: string | null
          clinician_id?: string | null
          created_at?: string
          diagnosis?: string | null
          diagnosis_codes?: Json | null
          dispensed_at?: string | null
          dispensed_by?: string | null
          encounter_date?: string
          encounter_type?: Database["public"]["Enums"]["encounter_type"]
          examination_notes?: string | null
          facility_id?: string | null
          icd10_code?: string | null
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
          case_classification?: string | null
          chief_complaint?: string | null
          clinician_id?: string | null
          created_at?: string
          diagnosis?: string | null
          diagnosis_codes?: Json | null
          dispensed_at?: string | null
          dispensed_by?: string | null
          encounter_date?: string
          encounter_type?: Database["public"]["Enums"]["encounter_type"]
          examination_notes?: string | null
          facility_id?: string | null
          icd10_code?: string | null
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
          approved_at: string | null
          approved_by: string | null
          bed_count: number | null
          created_at: string
          dhis2_orgunit_id: string | null
          district: string | null
          email: string | null
          facility_code: string | null
          facility_type: Database["public"]["Enums"]["facility_type"]
          id: string
          latitude: number | null
          lga_code: string | null
          longitude: number | null
          name: string
          phone: string | null
          region: string | null
          rejection_reason: string | null
          sormas_facility_uuid: string | null
          state_code: string | null
          status: Database["public"]["Enums"]["facility_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bed_count?: number | null
          created_at?: string
          dhis2_orgunit_id?: string | null
          district?: string | null
          email?: string | null
          facility_code?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"]
          id?: string
          latitude?: number | null
          lga_code?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          region?: string | null
          rejection_reason?: string | null
          sormas_facility_uuid?: string | null
          state_code?: string | null
          status?: Database["public"]["Enums"]["facility_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bed_count?: number | null
          created_at?: string
          dhis2_orgunit_id?: string | null
          district?: string | null
          email?: string | null
          facility_code?: string | null
          facility_type?: Database["public"]["Enums"]["facility_type"]
          id?: string
          latitude?: number | null
          lga_code?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          region?: string | null
          rejection_reason?: string | null
          sormas_facility_uuid?: string | null
          state_code?: string | null
          status?: Database["public"]["Enums"]["facility_status"]
          updated_at?: string
        }
        Relationships: []
      }
      facility_payment_credentials: {
        Row: {
          account_number: string | null
          business_name: string | null
          configured_by: string | null
          created_at: string
          facility_id: string
          is_active: boolean
          percentage_charge: number
          provider: string
          settlement_bank: string | null
          subaccount_code: string | null
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          business_name?: string | null
          configured_by?: string | null
          created_at?: string
          facility_id: string
          is_active?: boolean
          percentage_charge?: number
          provider?: string
          settlement_bank?: string | null
          subaccount_code?: string | null
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          business_name?: string | null
          configured_by?: string | null
          created_at?: string
          facility_id?: string
          is_active?: boolean
          percentage_charge?: number
          provider?: string
          settlement_bank?: string | null
          subaccount_code?: string | null
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
      invoice_items: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          method: string
          notes: string | null
          payment_transaction_id: string | null
          recorded_by: string
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          method?: string
          notes?: string | null
          payment_transaction_id?: string | null
          recorded_by: string
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          method?: string
          notes?: string | null
          payment_transaction_id?: string | null
          recorded_by?: string
          reference?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_paid: number
          created_at: string
          created_by: string | null
          discount: number
          encounter_id: string | null
          facility_id: string
          id: string
          invoice_number: string
          notes: string | null
          paid_at: string | null
          patient_id: string
          payment_method: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          created_by?: string | null
          discount?: number
          encounter_id?: string | null
          facility_id: string
          id?: string
          invoice_number: string
          notes?: string | null
          paid_at?: string | null
          patient_id: string
          payment_method?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          created_by?: string | null
          discount?: number
          encounter_id?: string | null
          facility_id?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          patient_id?: string
          payment_method?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
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
      patient_referrals: {
        Row: {
          clinical_summary: string | null
          created_at: string
          encounter_id: string | null
          id: string
          patient_id: string
          reason: string
          receiving_facility_id: string
          referring_clinician_id: string | null
          referring_facility_id: string
          responded_at: string | null
          responded_by: string | null
          response_notes: string | null
          status: string
          updated_at: string
          urgency: string
        }
        Insert: {
          clinical_summary?: string | null
          created_at?: string
          encounter_id?: string | null
          id?: string
          patient_id: string
          reason: string
          receiving_facility_id: string
          referring_clinician_id?: string | null
          referring_facility_id: string
          responded_at?: string | null
          responded_by?: string | null
          response_notes?: string | null
          status?: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          clinical_summary?: string | null
          created_at?: string
          encounter_id?: string | null
          id?: string
          patient_id?: string
          reason?: string
          receiving_facility_id?: string
          referring_clinician_id?: string | null
          referring_facility_id?: string
          responded_at?: string | null
          responded_by?: string | null
          response_notes?: string | null
          status?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: []
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
      payment_transactions: {
        Row: {
          access_code: string | null
          amount: number
          authorization_url: string | null
          channel: string | null
          created_at: string
          currency: string
          facility_id: string
          gateway_response: string | null
          id: string
          initiated_by: string | null
          invoice_id: string | null
          metadata: Json | null
          paid_at: string | null
          patient_id: string | null
          provider: string
          raw_response: Json | null
          reference: string
          status: string
          updated_at: string
        }
        Insert: {
          access_code?: string | null
          amount: number
          authorization_url?: string | null
          channel?: string | null
          created_at?: string
          currency?: string
          facility_id: string
          gateway_response?: string | null
          id?: string
          initiated_by?: string | null
          invoice_id?: string | null
          metadata?: Json | null
          paid_at?: string | null
          patient_id?: string | null
          provider?: string
          raw_response?: Json | null
          reference: string
          status?: string
          updated_at?: string
        }
        Update: {
          access_code?: string | null
          amount?: number
          authorization_url?: string | null
          channel?: string | null
          created_at?: string
          currency?: string
          facility_id?: string
          gateway_response?: string | null
          id?: string
          initiated_by?: string | null
          invoice_id?: string | null
          metadata?: Json | null
          paid_at?: string | null
          patient_id?: string | null
          provider?: string
          raw_response?: Json | null
          reference?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          is_secret: boolean
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_secret?: boolean
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          is_secret?: boolean
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
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
          is_suspended: boolean
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
          is_suspended?: boolean
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
          is_suspended?: boolean
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
      rescue_requests: {
        Row: {
          arrived_hospital_at: string | null
          assigned_ambulance_id: string | null
          assigned_at: string | null
          caller_name: string
          caller_phone: string | null
          caller_user_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          destination_eta_minutes: number | null
          destination_hospital_id: string | null
          id: string
          notes: string | null
          patient_id: string | null
          picked_up_at: string | null
          pickup_address: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          status: string
          suggested_hospital_id: string | null
          symptom_summary: string | null
          updated_at: string
          urgency: string
        }
        Insert: {
          arrived_hospital_at?: string | null
          assigned_ambulance_id?: string | null
          assigned_at?: string | null
          caller_name: string
          caller_phone?: string | null
          caller_user_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          destination_eta_minutes?: number | null
          destination_hospital_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          picked_up_at?: string | null
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          status?: string
          suggested_hospital_id?: string | null
          symptom_summary?: string | null
          updated_at?: string
          urgency?: string
        }
        Update: {
          arrived_hospital_at?: string | null
          assigned_ambulance_id?: string | null
          assigned_at?: string | null
          caller_name?: string
          caller_phone?: string | null
          caller_user_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          destination_eta_minutes?: number | null
          destination_hospital_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          picked_up_at?: string | null
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          status?: string
          suggested_hospital_id?: string | null
          symptom_summary?: string | null
          updated_at?: string
          urgency?: string
        }
        Relationships: []
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
      user_suspensions: {
        Row: {
          id: string
          lifted_at: string | null
          lifted_by: string | null
          reason: string
          suspended_at: string
          suspended_by: string
          user_id: string
        }
        Insert: {
          id?: string
          lifted_at?: string | null
          lifted_by?: string | null
          reason: string
          suspended_at?: string
          suspended_by: string
          user_id: string
        }
        Update: {
          id?: string
          lifted_at?: string | null
          lifted_by?: string | null
          reason?: string
          suspended_at?: string
          suspended_by?: string
          user_id?: string
        }
        Relationships: []
      }
      ward_beds: {
        Row: {
          admission_date: string | null
          bed_number: string
          created_at: string
          discharge_date: string | null
          facility_id: string
          id: string
          isolation_flag: boolean
          notes: string | null
          patient_id: string | null
          status: string
          updated_at: string
          ward_name: string
        }
        Insert: {
          admission_date?: string | null
          bed_number: string
          created_at?: string
          discharge_date?: string | null
          facility_id: string
          id?: string
          isolation_flag?: boolean
          notes?: string | null
          patient_id?: string | null
          status?: string
          updated_at?: string
          ward_name: string
        }
        Update: {
          admission_date?: string | null
          bed_number?: string
          created_at?: string
          discharge_date?: string | null
          facility_id?: string
          id?: string
          isolation_flag?: boolean
          notes?: string | null
          patient_id?: string | null
          status?: string
          updated_at?: string
          ward_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ward_beds_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ward_beds_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      enforce_rate_limit: {
        Args: {
          _per_hour: number
          _per_minute: number
          _table: string
          _user_col: string
        }
        Returns: undefined
      }
      get_user_facility_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_suspended: { Args: { _user_id: string }; Returns: boolean }
      jsonb_diff_keys: { Args: { _new: Json; _old: Json }; Returns: string[] }
      log_audit_event: {
        Args: {
          _action: string
          _details?: Json
          _entity_id: string
          _entity_type: string
          _facility_id?: string
        }
        Returns: string
      }
      user_can_access_referral: {
        Args: { _receiving: string; _referring: string; _user_id: string }
        Returns: boolean
      }
      user_can_view_rescue: {
        Args: { _rescue_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_referral_access_to_patient: {
        Args: { _patient_id: string; _user_id: string }
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
        | "paramedic"
      encounter_type:
        | "consultation"
        | "emergency"
        | "follow_up"
        | "referral"
        | "anc"
        | "immunization"
        | "lab"
      facility_status:
        | "pending"
        | "active"
        | "suspended"
        | "deactivated"
        | "rejected"
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
        "paramedic",
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
      facility_status: [
        "pending",
        "active",
        "suspended",
        "deactivated",
        "rejected",
      ],
      facility_type: ["primary", "secondary", "tertiary", "clinic", "hospital"],
      gender_type: ["male", "female", "other"],
      patient_status: ["active", "inactive", "deceased", "transferred"],
    },
  },
} as const

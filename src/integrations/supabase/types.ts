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
      cashier_movements: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string | null
          movement_type: string
          notes: string | null
          recorded_by: string
          reference: string | null
          shift_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          movement_type: string
          notes?: string | null
          recorded_by: string
          reference?: string | null
          shift_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          movement_type?: string
          notes?: string | null
          recorded_by?: string
          reference?: string | null
          shift_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cashier_movements_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "cashier_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      cashier_shifts: {
        Row: {
          actual_cash: number | null
          cashier_id: string
          closed_at: string | null
          created_at: string
          expected_cash: number
          facility_id: string
          id: string
          notes: string | null
          opened_at: string
          opening_cash: number
          status: string
          updated_at: string
          variance: number | null
        }
        Insert: {
          actual_cash?: number | null
          cashier_id: string
          closed_at?: string | null
          created_at?: string
          expected_cash?: number
          facility_id: string
          id?: string
          notes?: string | null
          opened_at?: string
          opening_cash?: number
          status?: string
          updated_at?: string
          variance?: number | null
        }
        Update: {
          actual_cash?: number | null
          cashier_id?: string
          closed_at?: string | null
          created_at?: string
          expected_cash?: number
          facility_id?: string
          id?: string
          notes?: string | null
          opened_at?: string
          opening_cash?: number
          status?: string
          updated_at?: string
          variance?: number | null
        }
        Relationships: []
      }
      clinical_tasks: {
        Row: {
          assignee_id: string | null
          assignee_role: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          encounter_id: string | null
          facility_id: string
          id: string
          patient_id: string | null
          priority: string
          related_entity_id: string | null
          related_entity_type: string | null
          status: string
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          assignee_role?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          encounter_id?: string | null
          facility_id: string
          id?: string
          patient_id?: string | null
          priority?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          assignee_role?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          encounter_id?: string | null
          facility_id?: string
          id?: string
          patient_id?: string | null
          priority?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      consent_forms: {
        Row: {
          body: string
          collected_by: string
          consent_type: string
          created_at: string
          encounter_id: string | null
          facility_id: string
          id: string
          patient_id: string
          signature_image_url: string | null
          signed_at: string | null
          signed_by_patient_name: string | null
          status: string
          title: string
          updated_at: string
          witness_name: string | null
          witness_signature_url: string | null
        }
        Insert: {
          body: string
          collected_by: string
          consent_type: string
          created_at?: string
          encounter_id?: string | null
          facility_id: string
          id?: string
          patient_id: string
          signature_image_url?: string | null
          signed_at?: string | null
          signed_by_patient_name?: string | null
          status?: string
          title: string
          updated_at?: string
          witness_name?: string | null
          witness_signature_url?: string | null
        }
        Update: {
          body?: string
          collected_by?: string
          consent_type?: string
          created_at?: string
          encounter_id?: string | null
          facility_id?: string
          id?: string
          patient_id?: string
          signature_image_url?: string | null
          signed_at?: string | null
          signed_by_patient_name?: string | null
          status?: string
          title?: string
          updated_at?: string
          witness_name?: string | null
          witness_signature_url?: string | null
        }
        Relationships: []
      }
      critical_value_callbacks: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          callback_method: string
          created_at: string
          facility_id: string
          id: string
          lab_result_id: string
          notes: string | null
          notified_at: string
          notified_by: string
          notified_clinician_id: string | null
          patient_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          callback_method?: string
          created_at?: string
          facility_id: string
          id?: string
          lab_result_id: string
          notes?: string | null
          notified_at?: string
          notified_by: string
          notified_clinician_id?: string | null
          patient_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          callback_method?: string
          created_at?: string
          facility_id?: string
          id?: string
          lab_result_id?: string
          notes?: string | null
          notified_at?: string
          notified_by?: string
          notified_clinician_id?: string | null
          patient_id?: string
        }
        Relationships: []
      }
      demo_seed_status: {
        Row: {
          created_at: string
          credentials: Json | null
          id: string
          message: string | null
          status: string
        }
        Insert: {
          created_at?: string
          credentials?: Json | null
          id?: string
          message?: string | null
          status: string
        }
        Update: {
          created_at?: string
          credentials?: Json | null
          id?: string
          message?: string | null
          status?: string
        }
        Relationships: []
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
      encounter_signoffs: {
        Row: {
          encounter_id: string
          encounter_snapshot: Json
          facility_id: string
          id: string
          ip_address: string | null
          signature_text: string
          signed_at: string
          signed_by: string
          user_agent: string | null
        }
        Insert: {
          encounter_id: string
          encounter_snapshot: Json
          facility_id: string
          id?: string
          ip_address?: string | null
          signature_text: string
          signed_at?: string
          signed_by: string
          user_agent?: string | null
        }
        Update: {
          encounter_id?: string
          encounter_snapshot?: Json
          facility_id?: string
          id?: string
          ip_address?: string | null
          signature_text?: string
          signed_at?: string
          signed_by?: string
          user_agent?: string | null
        }
        Relationships: []
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
      insurance_claim_batches: {
        Row: {
          amount_paid: number
          batch_number: string
          created_at: string
          created_by: string | null
          facility_id: string
          id: string
          notes: string | null
          period_end: string
          period_start: string
          reconciled_at: string | null
          scheme_id: string
          status: string
          submitted_at: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          batch_number: string
          created_at?: string
          created_by?: string | null
          facility_id: string
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          reconciled_at?: string | null
          scheme_id: string
          status?: string
          submitted_at?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          batch_number?: string
          created_at?: string
          created_by?: string | null
          facility_id?: string
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          reconciled_at?: string | null
          scheme_id?: string
          status?: string
          submitted_at?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claim_batches_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "insurance_schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_claim_items: {
        Row: {
          category: string
          claim_id: string
          created_at: string
          description: string
          id: string
          quantity: number
          scheme_tariff: number | null
          total: number
          unit_price: number
        }
        Insert: {
          category?: string
          claim_id: string
          created_at?: string
          description: string
          id?: string
          quantity?: number
          scheme_tariff?: number | null
          total?: number
          unit_price?: number
        }
        Update: {
          category?: string
          claim_id?: string
          created_at?: string
          description?: string
          id?: string
          quantity?: number
          scheme_tariff?: number | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claim_items_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "insurance_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_claims: {
        Row: {
          batch_id: string | null
          claim_number: string
          copay_amount: number
          created_at: string
          created_by: string | null
          decided_at: string | null
          diagnosis_code: string | null
          encounter_id: string | null
          enrolment_id: string | null
          facility_id: string
          gross_amount: number
          id: string
          invoice_id: string | null
          patient_id: string
          preauth_id: string | null
          rejection_reason: string | null
          scheme_id: string
          scheme_paid: number
          scheme_payable: number
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          batch_id?: string | null
          claim_number: string
          copay_amount?: number
          created_at?: string
          created_by?: string | null
          decided_at?: string | null
          diagnosis_code?: string | null
          encounter_id?: string | null
          enrolment_id?: string | null
          facility_id: string
          gross_amount?: number
          id?: string
          invoice_id?: string | null
          patient_id: string
          preauth_id?: string | null
          rejection_reason?: string | null
          scheme_id: string
          scheme_paid?: number
          scheme_payable?: number
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          batch_id?: string | null
          claim_number?: string
          copay_amount?: number
          created_at?: string
          created_by?: string | null
          decided_at?: string | null
          diagnosis_code?: string | null
          encounter_id?: string | null
          enrolment_id?: string | null
          facility_id?: string
          gross_amount?: number
          id?: string
          invoice_id?: string | null
          patient_id?: string
          preauth_id?: string | null
          rejection_reason?: string | null
          scheme_id?: string
          scheme_paid?: number
          scheme_payable?: number
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "insurance_claim_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_enrolment_id_fkey"
            columns: ["enrolment_id"]
            isOneToOne: false
            referencedRelation: "patient_insurance_enrolments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_preauth_id_fkey"
            columns: ["preauth_id"]
            isOneToOne: false
            referencedRelation: "insurance_preauthorizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "insurance_schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_preauthorizations: {
        Row: {
          authorization_code: string | null
          created_at: string
          decided_at: string | null
          encounter_id: string | null
          enrolment_id: string | null
          estimated_amount: number
          facility_id: string
          id: string
          patient_id: string
          reason: string
          requested_by: string | null
          scheme_id: string
          scheme_response: string | null
          status: string
          updated_at: string
        }
        Insert: {
          authorization_code?: string | null
          created_at?: string
          decided_at?: string | null
          encounter_id?: string | null
          enrolment_id?: string | null
          estimated_amount?: number
          facility_id: string
          id?: string
          patient_id: string
          reason: string
          requested_by?: string | null
          scheme_id: string
          scheme_response?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          authorization_code?: string | null
          created_at?: string
          decided_at?: string | null
          encounter_id?: string | null
          enrolment_id?: string | null
          estimated_amount?: number
          facility_id?: string
          id?: string
          patient_id?: string
          reason?: string
          requested_by?: string | null
          scheme_id?: string
          scheme_response?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_preauthorizations_enrolment_id_fkey"
            columns: ["enrolment_id"]
            isOneToOne: false
            referencedRelation: "patient_insurance_enrolments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_preauthorizations_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "insurance_schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_schemes: {
        Row: {
          active: boolean
          code: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          default_copay_percent: number
          facility_id: string
          id: string
          name: string
          preauth_required: boolean
          scheme_type: string
          tariff_notes: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          code?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          default_copay_percent?: number
          facility_id: string
          id?: string
          name: string
          preauth_required?: boolean
          scheme_type: string
          tariff_notes?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          default_copay_percent?: number
          facility_id?: string
          id?: string
          name?: string
          preauth_required?: boolean
          scheme_type?: string
          tariff_notes?: string | null
          updated_at?: string
        }
        Relationships: []
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
      medication_administrations: {
        Row: {
          administered_at: string | null
          administered_by: string | null
          created_at: string
          dose: string
          drug_name: string
          encounter_id: string | null
          facility_id: string
          hold_reason: string | null
          id: string
          notes: string | null
          patient_id: string
          route: string | null
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          administered_at?: string | null
          administered_by?: string | null
          created_at?: string
          dose: string
          drug_name: string
          encounter_id?: string | null
          facility_id: string
          hold_reason?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          route?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          administered_at?: string | null
          administered_by?: string | null
          created_at?: string
          dose?: string
          drug_name?: string
          encounter_id?: string | null
          facility_id?: string
          hold_reason?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          route?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_deposits: {
        Row: {
          amount: number
          balance: number
          created_at: string
          facility_id: string
          id: string
          notes: string | null
          patient_id: string
          recorded_by: string
          reference: string | null
          shift_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          balance: number
          created_at?: string
          facility_id: string
          id?: string
          notes?: string | null
          patient_id: string
          recorded_by: string
          reference?: string | null
          shift_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          balance?: number
          created_at?: string
          facility_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          recorded_by?: string
          reference?: string | null
          shift_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_deposits_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "cashier_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_insurance_enrolments: {
        Row: {
          card_image_url: string | null
          created_at: string
          dependents: Json
          id: string
          is_primary: boolean
          patient_id: string
          policy_number: string
          scheme_id: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          card_image_url?: string | null
          created_at?: string
          dependents?: Json
          id?: string
          is_primary?: boolean
          patient_id: string
          policy_number: string
          scheme_id: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          card_image_url?: string | null
          created_at?: string
          dependents?: Json
          id?: string
          is_primary?: boolean
          patient_id?: string
          policy_number?: string
          scheme_id?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_insurance_enrolments_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "insurance_schemes"
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
      sms_outbox: {
        Row: {
          channel: string
          created_at: string
          created_by: string | null
          external_id: string | null
          facility_id: string | null
          id: string
          last_error: string | null
          max_retries: number
          message: string
          next_retry_at: string | null
          provider: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          retry_count: number
          sent_at: string | null
          status: string
          to_phone: string
          updated_at: string
        }
        Insert: {
          channel?: string
          created_at?: string
          created_by?: string | null
          external_id?: string | null
          facility_id?: string | null
          id?: string
          last_error?: string | null
          max_retries?: number
          message: string
          next_retry_at?: string | null
          provider?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          retry_count?: number
          sent_at?: string | null
          status?: string
          to_phone: string
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          created_by?: string | null
          external_id?: string | null
          facility_id?: string | null
          id?: string
          last_error?: string | null
          max_retries?: number
          message?: string
          next_retry_at?: string | null
          provider?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          retry_count?: number
          sent_at?: string | null
          status?: string
          to_phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      specimens: {
        Row: {
          barcode: string
          chain_of_custody: Json
          collected_at: string
          collected_by: string | null
          created_at: string
          encounter_id: string | null
          facility_id: string
          id: string
          lab_result_id: string | null
          patient_id: string
          received_at: string | null
          received_by: string | null
          rejection_reason: string | null
          resulted_at: string | null
          specimen_type: string
          status: string
          test_requested: string
          updated_at: string
        }
        Insert: {
          barcode: string
          chain_of_custody?: Json
          collected_at?: string
          collected_by?: string | null
          created_at?: string
          encounter_id?: string | null
          facility_id: string
          id?: string
          lab_result_id?: string | null
          patient_id: string
          received_at?: string | null
          received_by?: string | null
          rejection_reason?: string | null
          resulted_at?: string | null
          specimen_type: string
          status?: string
          test_requested: string
          updated_at?: string
        }
        Update: {
          barcode?: string
          chain_of_custody?: Json
          collected_at?: string
          collected_by?: string | null
          created_at?: string
          encounter_id?: string | null
          facility_id?: string
          id?: string
          lab_result_id?: string | null
          patient_id?: string
          received_at?: string | null
          received_by?: string | null
          rejection_reason?: string | null
          resulted_at?: string | null
          specimen_type?: string
          status?: string
          test_requested?: string
          updated_at?: string
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
      vitals_observations: {
        Row: {
          consciousness: string | null
          created_at: string
          diastolic_bp: number | null
          encounter_id: string | null
          facility_id: string
          id: string
          news2_score: number | null
          notes: string | null
          observed_at: string
          pain_score: number | null
          patient_id: string
          pulse_bpm: number | null
          recorded_by: string | null
          respiratory_rate: number | null
          spo2: number | null
          systolic_bp: number | null
          temperature_c: number | null
        }
        Insert: {
          consciousness?: string | null
          created_at?: string
          diastolic_bp?: number | null
          encounter_id?: string | null
          facility_id: string
          id?: string
          news2_score?: number | null
          notes?: string | null
          observed_at?: string
          pain_score?: number | null
          patient_id: string
          pulse_bpm?: number | null
          recorded_by?: string | null
          respiratory_rate?: number | null
          spo2?: number | null
          systolic_bp?: number | null
          temperature_c?: number | null
        }
        Update: {
          consciousness?: string | null
          created_at?: string
          diastolic_bp?: number | null
          encounter_id?: string | null
          facility_id?: string
          id?: string
          news2_score?: number | null
          notes?: string | null
          observed_at?: string
          pain_score?: number | null
          patient_id?: string
          pulse_bpm?: number | null
          recorded_by?: string | null
          respiratory_rate?: number | null
          spo2?: number | null
          systolic_bp?: number | null
          temperature_c?: number | null
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
        | "citizen"
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
        "citizen",
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

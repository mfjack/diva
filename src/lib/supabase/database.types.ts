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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appointment_series: {
        Row: {
          created_at: string
          id: string
          patient_id: string
          psychologist_id: string
          repeat: Database["public"]["Enums"]["session_repeat"]
          repeat_until: string
          starts_on: string
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          psychologist_id: string
          repeat: Database["public"]["Enums"]["session_repeat"]
          repeat_until: string
          starts_on: string
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          psychologist_id?: string
          repeat?: Database["public"]["Enums"]["session_repeat"]
          repeat_until?: string
          starts_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_series_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_series_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_series_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: Database["public"]["Enums"]["cancellation_actor"] | null
          created_at: string
          ends_at: string
          id: string
          is_late_cancellation: boolean
          meeting_url: string | null
          modality: Database["public"]["Enums"]["appointment_modality"]
          patient_id: string
          price_cents: number
          psychologist_id: string
          rescheduled_from_id: string | null
          series_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?:
            | Database["public"]["Enums"]["cancellation_actor"]
            | null
          created_at?: string
          ends_at: string
          id?: string
          is_late_cancellation?: boolean
          meeting_url?: string | null
          modality: Database["public"]["Enums"]["appointment_modality"]
          patient_id: string
          price_cents: number
          psychologist_id: string
          rescheduled_from_id?: string | null
          series_id?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?:
            | Database["public"]["Enums"]["cancellation_actor"]
            | null
          created_at?: string
          ends_at?: string
          id?: string
          is_late_cancellation?: boolean
          meeting_url?: string | null
          modality?: Database["public"]["Enums"]["appointment_modality"]
          patient_id?: string
          price_cents?: number
          psychologist_id?: string
          rescheduled_from_id?: string | null
          series_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_rescheduled_from_id_fkey"
            columns: ["rescheduled_from_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "appointment_series"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_blocks: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          psychologist_id: string
          reason: string | null
          starts_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          psychologist_id: string
          reason?: string | null
          starts_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          psychologist_id?: string
          reason?: string | null
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_rules: {
        Row: {
          created_at: string
          end_time: string
          id: string
          modality: Database["public"]["Enums"]["appointment_modality"] | null
          psychologist_id: string
          start_time: string
          updated_at: string
          weekday: number
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          modality?: Database["public"]["Enums"]["appointment_modality"] | null
          psychologist_id: string
          start_time: string
          updated_at?: string
          weekday: number
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          modality?: Database["public"]["Enums"]["appointment_modality"] | null
          psychologist_id?: string
          start_time?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_records: {
        Row: {
          appointment_id: string | null
          created_at: string
          deleted_at: string | null
          encrypted_content: string
          id: string
          kind: Database["public"]["Enums"]["clinical_record_kind"]
          patient_id: string
          psychologist_id: string
          title: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          deleted_at?: string | null
          encrypted_content: string
          id?: string
          kind: Database["public"]["Enums"]["clinical_record_kind"]
          patient_id: string
          psychologist_id: string
          title: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          deleted_at?: string | null
          encrypted_content?: string
          id?: string
          kind?: Database["public"]["Enums"]["clinical_record_kind"]
          patient_id?: string
          psychologist_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_records_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["clinical_record_kind"]
          psychologist_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["clinical_record_kind"]
          psychologist_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["clinical_record_kind"]
          psychologist_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_attachments: {
        Row: {
          content_type: string
          created_at: string
          expense_id: string
          file_name: string
          id: string
          psychologist_id: string
          size_bytes: number
          storage_path: string
        }
        Insert: {
          content_type: string
          created_at?: string
          expense_id: string
          file_name: string
          id?: string
          psychologist_id: string
          size_bytes: number
          storage_path: string
        }
        Update: {
          content_type?: string
          created_at?: string
          expense_id?: string
          file_name?: string
          id?: string
          psychologist_id?: string
          size_bytes?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_attachments_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_attachments_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_payments: {
        Row: {
          created_at: string
          due_on: string
          expense_id: string
          id: string
          paid_on: string
          psychologist_id: string
        }
        Insert: {
          created_at?: string
          due_on: string
          expense_id: string
          id?: string
          paid_on: string
          psychologist_id: string
        }
        Update: {
          created_at?: string
          due_on?: string
          expense_id?: string
          id?: string
          paid_on?: string
          psychologist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_payments_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_payments_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount_cents: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          description: string
          ends_on: string | null
          id: string
          installment_count: number | null
          notes: string | null
          psychologist_id: string
          recurrence: Database["public"]["Enums"]["expense_recurrence"]
          starts_on: string
        }
        Insert: {
          amount_cents: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description: string
          ends_on?: string | null
          id?: string
          installment_count?: number | null
          notes?: string | null
          psychologist_id: string
          recurrence?: Database["public"]["Enums"]["expense_recurrence"]
          starts_on: string
        }
        Update: {
          amount_cents?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string
          ends_on?: string | null
          id?: string
          installment_count?: number | null
          notes?: string | null
          psychologist_id?: string
          recurrence?: Database["public"]["Enums"]["expense_recurrence"]
          starts_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          billing_day: number | null
          birth_date: string | null
          cpf: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          health_insurance: string | null
          id: string
          notes: string | null
          payment_plan: Database["public"]["Enums"]["payment_plan"]
          phone: string | null
          preferred_modality: Database["public"]["Enums"]["appointment_modality"]
          psychologist_id: string
          session_price_cents: number | null
          status: Database["public"]["Enums"]["patient_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_day?: number | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          health_insurance?: string | null
          id?: string
          notes?: string | null
          payment_plan?: Database["public"]["Enums"]["payment_plan"]
          phone?: string | null
          preferred_modality?: Database["public"]["Enums"]["appointment_modality"]
          psychologist_id: string
          session_price_cents?: number | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_day?: number | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          health_insurance?: string | null
          id?: string
          notes?: string | null
          payment_plan?: Database["public"]["Enums"]["payment_plan"]
          phone?: string | null
          preferred_modality?: Database["public"]["Enums"]["appointment_modality"]
          psychologist_id?: string
          session_price_cents?: number | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          appointment_id: string
          created_at: string
          due_date: string
          gateway_charge_id: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"] | null
          notes: string | null
          paid_at: string | null
          patient_id: string
          psychologist_id: string
          receipt_number: number | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount_cents: number
          appointment_id: string
          created_at?: string
          due_date: string
          gateway_charge_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"] | null
          notes?: string | null
          paid_at?: string | null
          patient_id: string
          psychologist_id: string
          receipt_number?: number | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          appointment_id?: string
          created_at?: string
          due_date?: string
          gateway_charge_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"] | null
          notes?: string | null
          paid_at?: string | null
          patient_id?: string
          psychologist_id?: string
          receipt_number?: number | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_summaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_webhook_events: {
        Row: {
          event_id: string
          processed_at: string
          provider: string
        }
        Insert: {
          event_id: string
          processed_at?: string
          provider: string
        }
        Update: {
          event_id?: string
          processed_at?: string
          provider?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      psychologist_settings: {
        Row: {
          bio: string | null
          booking_window_days: number
          cancellation_notice_hours: number
          cpf: string | null
          created_at: string
          default_session_price_cents: number
          meeting_url: string | null
          minimum_booking_notice_hours: number
          office_address: string | null
          pix_key: string | null
          professional_registration: string | null
          psychologist_id: string
          session_duration_minutes: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          booking_window_days: number
          cancellation_notice_hours: number
          cpf?: string | null
          created_at?: string
          default_session_price_cents: number
          meeting_url?: string | null
          minimum_booking_notice_hours?: number
          office_address?: string | null
          pix_key?: string | null
          professional_registration?: string | null
          psychologist_id: string
          session_duration_minutes: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          booking_window_days?: number
          cancellation_notice_hours?: number
          cpf?: string | null
          created_at?: string
          default_session_price_cents?: number
          meeting_url?: string | null
          minimum_booking_notice_hours?: number
          office_address?: string | null
          pix_key?: string | null
          professional_registration?: string | null
          psychologist_id?: string
          session_duration_minutes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychologist_settings_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_notes: {
        Row: {
          content: Json
          created_at: string
          deleted_at: string | null
          id: string
          is_pinned: boolean
          kind: Database["public"]["Enums"]["study_note_kind"]
          plain_text: string
          psychologist_id: string
          source_author: string | null
          source_title: string | null
          source_url: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_pinned?: boolean
          kind?: Database["public"]["Enums"]["study_note_kind"]
          plain_text?: string
          psychologist_id: string
          source_author?: string | null
          source_title?: string | null
          source_url?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_pinned?: boolean
          kind?: Database["public"]["Enums"]["study_note_kind"]
          plain_text?: string
          psychologist_id?: string
          source_author?: string | null
          source_title?: string | null
          source_url?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_notes_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      patient_summaries: {
        Row: {
          billing_day: number | null
          birth_date: string | null
          completed_session_count: number | null
          cpf: string | null
          created_at: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          health_insurance: string | null
          id: string | null
          next_appointment_at: string | null
          notes: string | null
          payment_plan: Database["public"]["Enums"]["payment_plan"] | null
          pending_amount_cents: number | null
          phone: string | null
          preferred_modality:
            | Database["public"]["Enums"]["appointment_modality"]
            | null
          psychologist_id: string | null
          session_price_cents: number | null
          status: Database["public"]["Enums"]["patient_status"] | null
        }
        Insert: {
          billing_day?: number | null
          birth_date?: string | null
          completed_session_count?: never
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          health_insurance?: string | null
          id?: string | null
          next_appointment_at?: never
          notes?: string | null
          payment_plan?: Database["public"]["Enums"]["payment_plan"] | null
          pending_amount_cents?: never
          phone?: string | null
          preferred_modality?:
            | Database["public"]["Enums"]["appointment_modality"]
            | null
          psychologist_id?: string | null
          session_price_cents?: number | null
          status?: Database["public"]["Enums"]["patient_status"] | null
        }
        Update: {
          billing_day?: number | null
          birth_date?: string | null
          completed_session_count?: never
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          health_insurance?: string | null
          id?: string | null
          next_appointment_at?: never
          notes?: string | null
          payment_plan?: Database["public"]["Enums"]["payment_plan"] | null
          pending_amount_cents?: never
          phone?: string | null
          preferred_modality?:
            | Database["public"]["Enums"]["appointment_modality"]
            | null
          psychologist_id?: string | null
          session_price_cents?: number | null
          status?: Database["public"]["Enums"]["patient_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cancel_appointments: {
        Args: { p_cancellations: Json; p_reason: string }
        Returns: number
      }
      complete_finished_appointments: { Args: never; Returns: undefined }
      create_appointments: {
        Args: {
          p_patient_id: string
          p_repeat?: Database["public"]["Enums"]["session_repeat"]
          p_series_ends_on?: string
          p_series_starts_on?: string
          p_sessions: Json
        }
        Returns: number
      }
      delete_patient: {
        Args: { p_patient_id: string; p_reason: string }
        Returns: undefined
      }
      is_psychologist: { Args: never; Returns: boolean }
      payment_due_date: {
        Args: {
          p_billing_day: number
          p_payment_plan: Database["public"]["Enums"]["payment_plan"]
          p_starts_at: string
        }
        Returns: string
      }
      register_payment: {
        Args: {
          p_appointment_id: string
          p_method: Database["public"]["Enums"]["payment_method"]
          p_notes: string
          p_paid_at: string
        }
        Returns: undefined
      }
      replace_availability_rules: {
        Args: { p_rules: Json }
        Returns: undefined
      }
      undo_payment: { Args: { p_appointment_id: string }; Returns: undefined }
    }
    Enums: {
      appointment_modality: "in_person" | "online"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      cancellation_actor: "patient" | "psychologist"
      clinical_record_kind:
        | "session_note"
        | "report"
        | "certificate"
        | "referral"
      expense_category:
        | "supervision"
        | "education"
        | "materials"
        | "office"
        | "software"
        | "taxes"
        | "other"
      expense_recurrence: "once" | "weekly" | "monthly" | "installments"
      patient_status: "active" | "paused" | "discharged"
      payment_method:
        | "pix"
        | "cash"
        | "credit_card"
        | "debit_card"
        | "bank_transfer"
      payment_plan: "per_session" | "monthly"
      payment_status: "pending" | "paid" | "waived" | "refunded"
      session_repeat: "weekly" | "biweekly"
      study_note_kind:
        | "note"
        | "reflection"
        | "reading"
        | "supervision"
        | "course"
      user_role: "psychologist" | "patient"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      appointment_modality: ["in_person", "online"],
      appointment_status: [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      cancellation_actor: ["patient", "psychologist"],
      clinical_record_kind: [
        "session_note",
        "report",
        "certificate",
        "referral",
      ],
      expense_category: [
        "supervision",
        "education",
        "materials",
        "office",
        "software",
        "taxes",
        "other",
      ],
      expense_recurrence: ["once", "weekly", "monthly", "installments"],
      patient_status: ["active", "paused", "discharged"],
      payment_method: [
        "pix",
        "cash",
        "credit_card",
        "debit_card",
        "bank_transfer",
      ],
      payment_plan: ["per_session", "monthly"],
      payment_status: ["pending", "paid", "waived", "refunded"],
      session_repeat: ["weekly", "biweekly"],
      study_note_kind: [
        "note",
        "reflection",
        "reading",
        "supervision",
        "course",
      ],
      user_role: ["psychologist", "patient"],
    },
  },
} as const

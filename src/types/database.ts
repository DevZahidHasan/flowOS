export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Enums: {
      invoice_status: "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED" | "REFUNDED"
      payment_method: "CASH" | "CARD" | "BANK_TRANSFER" | "MOBILE_BANKING" | "CHEQUE" | "OTHER"
    }
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          slug: string
          industry_type: string
          logo_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          industry_type: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          industry_type?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      workspace_modules: {
        Row: {
          id: string
          workspace_id: string
          module_key: string
          is_enabled: boolean
          settings: Json
        }
        Insert: {
          id?: string
          workspace_id: string
          module_key: string
          is_enabled?: boolean
          settings?: Json
        }
        Update: {
          id?: string
          workspace_id?: string
          module_key?: string
          is_enabled?: boolean
          settings?: Json
        }
      }
      audit_logs: {
        Row: {
          id: string
          workspace_id: string
          user_id: string | null
          action: string
          entity_name: string
          entity_id: string | null
          payload: Json
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id?: string | null
          action: string
          entity_name: string
          entity_id?: string | null
          payload?: Json
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string | null
          action?: string
          entity_name?: string
          entity_id?: string | null
          payload?: Json
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          workspace_id: string
          name: string
          category: string
          description: string | null
          duration_min: number
          prep_time_min: number | null
          buffer_time_min: number | null
          cleanup_time_min: number | null
          price: number
          tax_rate: number | null
          required_skill: string | null
          color_code: string | null
          is_featured: boolean | null
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          category?: string
          description?: string | null
          duration_min?: number
          prep_time_min?: number | null
          buffer_time_min?: number | null
          cleanup_time_min?: number | null
          price?: number
          tax_rate?: number | null
          required_skill?: string | null
          color_code?: string | null
          is_featured?: boolean | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          category?: string
          description?: string | null
          duration_min?: number
          prep_time_min?: number | null
          buffer_time_min?: number | null
          cleanup_time_min?: number | null
          price?: number
          tax_rate?: number | null
          required_skill?: string | null
          color_code?: string | null
          is_featured?: boolean | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          workspace_id: string
          customer_id: string | null
          customer_name: string
          customer_email: string | null
          customer_phone: string | null
          service_id: string | null
          service_name: string
          staff_id: string | null
          staff_name: string
          start_time: string
          end_time: string
          status: string
          is_walk_in: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          customer_id?: string | null
          customer_name: string
          customer_email?: string | null
          customer_phone?: string | null
          service_id?: string | null
          service_name: string
          staff_id?: string | null
          staff_name?: string
          start_time: string
          end_time: string
          status?: string
          is_walk_in?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          customer_id?: string | null
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string | null
          service_id?: string | null
          service_name?: string
          staff_id?: string | null
          staff_name?: string
          start_time?: string
          end_time?: string
          status?: string
          is_walk_in?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
       queue_tokens: {
        Row: {
          id: string
          workspace_id: string
          customer_id: string | null
          token_number: string
          customer_name: string
          customer_phone: string | null
          service_name: string | null
          status: string
          estimated_wait_min: number
          served_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          customer_id?: string | null
          token_number: string
          customer_name: string
          customer_phone?: string | null
          service_name?: string | null
          status?: string
          estimated_wait_min?: number
          served_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          customer_id?: string | null
          token_number?: string
          customer_name?: string
          customer_phone?: string | null
          service_name?: string | null
          status?: string
          estimated_wait_min?: number
          served_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          workspace_id: string
          full_name: string
          email: string | null
          phone: string | null
          avatar_url: string | null
          birthday: string | null
          marketing_consent: boolean
          referral_source: string
          preferred_staff_name: string | null
          preferred_service_name: string | null
          tags: string[]
          loyalty_points: number
          total_visits: number
          lifetime_spending: number
          outstanding_balance: number
          last_visit_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          full_name: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          birthday?: string | null
          marketing_consent?: boolean
          referral_source?: string
          preferred_staff_name?: string | null
          preferred_service_name?: string | null
          tags?: string[]
          loyalty_points?: number
          total_visits?: number
          lifetime_spending?: number
          outstanding_balance?: number
          last_visit_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          birthday?: string | null
          marketing_consent?: boolean
          referral_source?: string
          preferred_staff_name?: string | null
          preferred_service_name?: string | null
          tags?: string[]
          loyalty_points?: number
          total_visits?: number
          lifetime_spending?: number
          outstanding_balance?: number
          last_visit_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customer_notes: {
        Row: {
          id: string
          workspace_id: string
          customer_id: string
          author_name: string
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          customer_id: string
          author_name: string
          note: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          customer_id?: string
          author_name?: string
          note?: string
          created_at?: string
        }
      }
      customer_timeline: {
        Row: {
          id: string
          workspace_id: string
          customer_id: string
          event_type: string
          title: string
          description: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          customer_id: string
          event_type: string
          title: string
          description?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          customer_id?: string
          event_type?: string
          title?: string
          description?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      staff_profiles: {
        Row: {
          id: string
          workspace_id: string
          user_id: string | null
          display_name: string
          role_title: string
          email: string | null
          phone: string | null
          avatar_url: string | null
          commission_rate: number
          specialties: string[]
          skills: string[]
          is_active: boolean
          average_rating: number
          completed_appointments: number
          total_revenue_generated: number
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id?: string | null
          display_name: string
          role_title?: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          commission_rate?: number
          specialties?: string[]
          skills?: string[]
          is_active?: boolean
          average_rating?: number
          completed_appointments?: number
          total_revenue_generated?: number
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string | null
          display_name?: string
          role_title?: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          commission_rate?: number
          specialties?: string[]
          skills?: string[]
          is_active?: boolean
          average_rating?: number
          completed_appointments?: number
          total_revenue_generated?: number
          created_at?: string
        }
      }
      staff_schedules: {
        Row: {
          id: string
          workspace_id: string
          staff_id: string
          day_of_week: number
          start_time: string
          end_time: string
          break_start: string | null
          break_end: string | null
          is_day_off: boolean
        }
        Insert: {
          id?: string
          workspace_id: string
          staff_id: string
          day_of_week: number
          start_time?: string
          end_time?: string
          break_start?: string | null
          break_end?: string | null
          is_day_off?: boolean
        }
        Update: {
          id?: string
          workspace_id?: string
          staff_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          break_start?: string | null
          break_end?: string | null
          is_day_off?: boolean
        }
      }
      staff_services: {
        Row: {
          id: string
          workspace_id: string
          staff_id: string
          service_id: string
        }
        Insert: {
          id?: string
          workspace_id: string
          staff_id: string
          service_id: string
        }
        Update: {
          id?: string
          workspace_id?: string
          staff_id?: string
          service_id?: string
        }
      }
      invoices: {
        Row: {
          id: string
          workspace_id: string
          customer_id: string
          appointment_id: string | null
          invoice_number: string
          status: Database["public"]["Enums"]["invoice_status"]
          currency: string
          subtotal: number
          discount_amount: number
          tax_amount: number
          total_amount: number
          issue_date: string
          due_date: string
          notes: string | null
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          customer_id: string
          appointment_id?: string | null
          invoice_number: string
          status?: Database["public"]["Enums"]["invoice_status"]
          currency?: string
          subtotal?: number
          discount_amount?: number
          tax_amount?: number
          total_amount?: number
          issue_date?: string
          due_date?: string
          notes?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          customer_id?: string
          appointment_id?: string | null
          invoice_number?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          currency?: string
          subtotal?: number
          discount_amount?: number
          tax_amount?: number
          total_amount?: number
          issue_date?: string
          due_date?: string
          notes?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          deleted_at?: string | null
        }
      }
      invoice_line_items: {
        Row: {
          id: string
          invoice_id: string
          service_id: string | null
          description: string
          quantity: number
          unit_price: number
          discount: number
          tax_rate: number
          total: number
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          invoice_id: string
          service_id?: string | null
          description: string
          quantity?: number
          unit_price?: number
          discount?: number
          tax_rate?: number
          total?: number
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          invoice_id?: string
          service_id?: string | null
          description?: string
          quantity?: number
          unit_price?: number
          discount?: number
          tax_rate?: number
          total?: number
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          deleted_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          workspace_id: string
          invoice_id: string
          amount: number
          payment_method: "CASH" | "CARD" | "BANK_TRANSFER" | "MOBILE_BANKING" | "CHEQUE" | "OTHER"
          reference_number: string | null
          notes: string | null
          payment_date: string
          received_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          invoice_id: string
          amount: number
          payment_method: "CASH" | "CARD" | "BANK_TRANSFER" | "MOBILE_BANKING" | "CHEQUE" | "OTHER"
          reference_number?: string | null
          notes?: string | null
          payment_date: string
          received_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          invoice_id?: string
          amount?: number
          payment_method?: "CASH" | "CARD" | "BANK_TRANSFER" | "MOBILE_BANKING" | "CHEQUE" | "OTHER"
          reference_number?: string | null
          notes?: string | null
          payment_date?: string
          received_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      projects_archive: {
        Row: {
          id: string
          workspace_id: string
          customer_id: string | null
          name: string
          description: string | null
          status: string
          priority: string
          progress_percentage: number
          budget: number
          estimated_hours: number
          actual_hours: number
          start_date: string | null
          due_date: string | null
          completed_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          workspace_id: string
          customer_id?: string | null
          name: string
          description?: string | null
          status?: string
          priority?: string
          progress_percentage?: number
          budget?: number
          estimated_hours?: number
          actual_hours?: number
          start_date?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          workspace_id?: string
          customer_id?: string | null
          name?: string
          description?: string | null
          status?: string
          priority?: string
          progress_percentage?: number
          budget?: number
          estimated_hours?: number
          actual_hours?: number
          start_date?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          workspace_id: string
          category: string | null
          labels: string[]
          title: string
          description: string | null
          status: string
          priority: string
          assignee_id: string | null
          estimated_hours: number
          actual_hours: number
          due_date: string | null
          order_index: number
          completed_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          is_archived: boolean
        }
        Insert: {
          id?: string
          workspace_id: string
          category?: string | null
          labels?: string[]
          title: string
          description?: string | null
          status?: string
          priority?: string
          assignee_id?: string | null
          estimated_hours?: number
          actual_hours?: number
          due_date?: string | null
          order_index?: number
          completed_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          is_archived?: boolean
        }
        Update: {
          id?: string
          workspace_id?: string
          category?: string | null
          labels?: string[]
          title?: string
          description?: string | null
          status?: string
          priority?: string
          assignee_id?: string | null
          estimated_hours?: number
          actual_hours?: number
          due_date?: string | null
          order_index?: number
          completed_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          is_archived?: boolean
        }
      }
    }
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      client_units: {
        Row: {
          access_instructions: string | null
          active: boolean
          address_complement: string | null
          address_line: string | null
          address_number: string | null
          city: string
          client_id: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string
          district: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          postal_code: string | null
          state: string
          tax_id: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          access_instructions?: string | null
          active?: boolean
          address_complement?: string | null
          address_line?: string | null
          address_number?: string | null
          city: string
          client_id: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by: string
          district?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          postal_code?: string | null
          state: string
          tax_id?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          access_instructions?: string | null
          active?: boolean
          address_complement?: string | null
          address_line?: string | null
          address_number?: string | null
          city?: string
          client_id?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string
          district?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          postal_code?: string | null
          state?: string
          tax_id?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_units_client_fkey"
            columns: ["organization_id", "client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "client_units_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_units_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "client_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_units_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_units_updated_by_membership_fkey"
            columns: ["organization_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
        ]
      }
      clients: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          id: string
          legal_name: string
          notes: string | null
          organization_id: string
          segment: string | null
          tax_id: string | null
          trade_name: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          id?: string
          legal_name: string
          notes?: string | null
          organization_id: string
          segment?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          id?: string
          legal_name?: string
          notes?: string | null
          organization_id?: string
          segment?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_updated_by_membership_fkey"
            columns: ["organization_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          profile_id: string
          role: Database["public"]["Enums"]["organization_role"]
          status: Database["public"]["Enums"]["organization_member_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          profile_id: string
          role: Database["public"]["Enums"]["organization_role"]
          status: Database["public"]["Enums"]["organization_member_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          status?: Database["public"]["Enums"]["organization_member_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          active: boolean
          created_at: string
          id: string
          legal_name: string | null
          name: string
          slug: string
          tax_id: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          legal_name?: string | null
          name: string
          slug: string
          tax_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          legal_name?: string | null
          name?: string
          slug?: string
          tax_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_types: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "service_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_updated_by_membership_fkey"
            columns: ["organization_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
        ]
      }
      skills: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skills_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "skills_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skills_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skills_updated_by_membership_fkey"
            columns: ["organization_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
        ]
      }
      technician_skills: {
        Row: {
          created_at: string
          created_by: string
          is_primary: boolean
          organization_id: string
          proficiency_level: number
          skill_id: string
          technician_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          created_by: string
          is_primary?: boolean
          organization_id: string
          proficiency_level: number
          skill_id: string
          technician_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          created_at?: string
          created_by?: string
          is_primary?: boolean
          organization_id?: string
          proficiency_level?: number
          skill_id?: string
          technician_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_skills_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_skills_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "technician_skills_skill_fkey"
            columns: ["organization_id", "skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "technician_skills_technician_fkey"
            columns: ["organization_id", "technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "technician_skills_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_skills_updated_by_membership_fkey"
            columns: ["organization_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
        ]
      }
      technician_unavailabilities: {
        Row: {
          active: boolean
          all_day: boolean
          created_at: string
          created_by: string
          ends_at: string
          id: string
          notes: string | null
          organization_id: string
          reason: string | null
          starts_at: string
          technician_id: string
          unavailability_type_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          active?: boolean
          all_day?: boolean
          created_at?: string
          created_by: string
          ends_at: string
          id?: string
          notes?: string | null
          organization_id: string
          reason?: string | null
          starts_at: string
          technician_id: string
          unavailability_type_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          active?: boolean
          all_day?: boolean
          created_at?: string
          created_by?: string
          ends_at?: string
          id?: string
          notes?: string | null
          organization_id?: string
          reason?: string | null
          starts_at?: string
          technician_id?: string
          unavailability_type_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_unavailabilities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_unavailabilities_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "technician_unavailabilities_organization_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_unavailabilities_technician_fkey"
            columns: ["organization_id", "technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "technician_unavailabilities_type_fkey"
            columns: ["organization_id", "unavailability_type_id"]
            isOneToOne: false
            referencedRelation: "technician_unavailability_types"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "technician_unavailabilities_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_unavailabilities_updated_by_membership_fkey"
            columns: ["organization_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
        ]
      }
      technician_unavailability_types: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_unavailability_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_unavailability_types_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "technician_unavailability_types_organization_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_unavailability_types_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_unavailability_types_updated_by_membership_fkey"
            columns: ["organization_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
        ]
      }
      technicians: {
        Row: {
          active: boolean
          base_city: string
          base_state: string
          can_drive_company_vehicle: boolean
          created_at: string
          created_by: string
          document: string | null
          driver_license_category: string | null
          driver_license_expires_at: string | null
          driver_license_number: string | null
          email: string | null
          id: string
          job_title: string | null
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          profile_id: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          active?: boolean
          base_city: string
          base_state: string
          can_drive_company_vehicle?: boolean
          created_at?: string
          created_by: string
          document?: string | null
          driver_license_category?: string | null
          driver_license_expires_at?: string | null
          driver_license_number?: string | null
          email?: string | null
          id?: string
          job_title?: string | null
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          active?: boolean
          base_city?: string
          base_state?: string
          can_drive_company_vehicle?: boolean
          created_at?: string
          created_by?: string
          document?: string | null
          driver_license_category?: string | null
          driver_license_expires_at?: string | null
          driver_license_number?: string | null
          email?: string | null
          id?: string
          job_title?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "technicians_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technicians_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "technicians_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technicians_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technicians_profile_membership_fkey"
            columns: ["organization_id", "profile_id"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "technicians_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technicians_updated_by_membership_fkey"
            columns: ["organization_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
        ]
      }
      vehicle_unavailabilities: {
        Row: {
          active: boolean
          all_day: boolean
          created_at: string
          created_by: string
          ends_at: string
          id: string
          notes: string | null
          organization_id: string
          reason: string | null
          starts_at: string
          unavailability_type_id: string
          updated_at: string
          updated_by: string
          vehicle_id: string
        }
        Insert: {
          active?: boolean
          all_day?: boolean
          created_at?: string
          created_by: string
          ends_at: string
          id?: string
          notes?: string | null
          organization_id: string
          reason?: string | null
          starts_at: string
          unavailability_type_id: string
          updated_at?: string
          updated_by: string
          vehicle_id: string
        }
        Update: {
          active?: boolean
          all_day?: boolean
          created_at?: string
          created_by?: string
          ends_at?: string
          id?: string
          notes?: string | null
          organization_id?: string
          reason?: string | null
          starts_at?: string
          unavailability_type_id?: string
          updated_at?: string
          updated_by?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_unavailabilities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_unavailabilities_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "vehicle_unavailabilities_organization_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_unavailabilities_type_fkey"
            columns: ["organization_id", "unavailability_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_unavailability_types"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "vehicle_unavailabilities_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_unavailabilities_updated_by_membership_fkey"
            columns: ["organization_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "vehicle_unavailabilities_vehicle_fkey"
            columns: ["organization_id", "vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      vehicle_unavailability_types: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_unavailability_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_unavailability_types_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "vehicle_unavailability_types_organization_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_unavailability_types_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_unavailability_types_updated_by_membership_fkey"
            columns: ["organization_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
        ]
      }
      vehicles: {
        Row: {
          active: boolean
          base_city: string
          base_state: string
          brand: string
          created_at: string
          created_by: string
          current_mileage: number | null
          id: string
          licensing_expires_at: string | null
          maintenance_due_at: string | null
          manufacture_year: number | null
          model: string
          model_year: number | null
          notes: string | null
          operational_status: Database["public"]["Enums"]["vehicle_operational_status"]
          organization_id: string
          passenger_capacity: number
          plate: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          active?: boolean
          base_city: string
          base_state: string
          brand: string
          created_at?: string
          created_by: string
          current_mileage?: number | null
          id?: string
          licensing_expires_at?: string | null
          maintenance_due_at?: string | null
          manufacture_year?: number | null
          model: string
          model_year?: number | null
          notes?: string | null
          operational_status?: Database["public"]["Enums"]["vehicle_operational_status"]
          organization_id: string
          passenger_capacity: number
          plate: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          active?: boolean
          base_city?: string
          base_state?: string
          brand?: string
          created_at?: string
          created_by?: string
          current_mileage?: number | null
          id?: string
          licensing_expires_at?: string | null
          maintenance_due_at?: string | null
          manufacture_year?: number | null
          model?: string
          model_year?: number | null
          notes?: string | null
          operational_status?: Database["public"]["Enums"]["vehicle_operational_status"]
          organization_id?: string
          passenger_capacity?: number
          plate?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "vehicles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_updated_by_membership_fkey"
            columns: ["organization_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_technician_with_skills: {
        Args: {
          p_base_city: string
          p_base_state: string
          p_can_drive_company_vehicle: boolean
          p_document: string | null
          p_driver_license_category: string | null
          p_driver_license_expires_at: string | null
          p_driver_license_number: string | null
          p_email: string | null
          p_job_title: string | null
          p_name: string
          p_notes: string | null
          p_organization_id: string
          p_phone: string | null
          p_skills: Json
        }
        Returns: string
      }
      link_technician_profile: {
        Args: {
          p_organization_id: string
          p_profile_id: string
          p_technician_id: string
        }
        Returns: boolean
      }
      list_available_technician_profiles: {
        Args: { p_organization_id: string; p_technician_id?: string }
        Returns: {
          email: string
          id: string
          name: string
        }[]
      }
      unlink_technician_profile: {
        Args: { p_organization_id: string; p_technician_id: string }
        Returns: boolean
      }
      update_technician_with_skills: {
        Args: {
          p_base_city: string
          p_base_state: string
          p_can_drive_company_vehicle: boolean
          p_document: string | null
          p_driver_license_category: string | null
          p_driver_license_expires_at: string | null
          p_driver_license_number: string | null
          p_email: string | null
          p_job_title: string | null
          p_name: string
          p_notes: string | null
          p_organization_id: string
          p_phone: string | null
          p_skills: Json
          p_technician_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      organization_member_status: "invited" | "active" | "blocked"
      organization_role: "admin" | "coordinator" | "technician"
      vehicle_operational_status: "available" | "maintenance" | "blocked"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      organization_member_status: ["invited", "active", "blocked"],
      organization_role: ["admin", "coordinator", "technician"],
      vehicle_operational_status: ["available", "maintenance", "blocked"],
    },
  },
} as const

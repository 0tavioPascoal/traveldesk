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
      trip_required_skills: {
        Row: {
          created_at: string
          created_by: string
          id: string
          minimum_proficiency_level: number
          notes: string | null
          organization_id: string
          skill_id: string
          trip_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          minimum_proficiency_level: number
          notes?: string | null
          organization_id: string
          skill_id: string
          trip_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          minimum_proficiency_level?: number
          notes?: string | null
          organization_id?: string
          skill_id?: string
          trip_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_required_skills_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_required_skills_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "trip_required_skills_skill_fkey"
            columns: ["organization_id", "skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "trip_required_skills_trip_fkey"
            columns: ["organization_id", "trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "trip_required_skills_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_required_skills_updated_by_membership_fkey"
            columns: ["organization_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
        ]
      }
      trip_technicians: {
        Row: {
          blocks_schedule: boolean
          created_at: string
          created_by: string
          id: string
          is_responsible: boolean
          notes: string | null
          occupancy_ends_at: string | null
          occupancy_starts_at: string | null
          organization_id: string
          technician_id: string
          trip_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          blocks_schedule?: boolean
          created_at?: string
          created_by: string
          id?: string
          is_responsible?: boolean
          notes?: string | null
          occupancy_ends_at?: string | null
          occupancy_starts_at?: string | null
          organization_id: string
          technician_id: string
          trip_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          blocks_schedule?: boolean
          created_at?: string
          created_by?: string
          id?: string
          is_responsible?: boolean
          notes?: string | null
          occupancy_ends_at?: string | null
          occupancy_starts_at?: string | null
          organization_id?: string
          technician_id?: string
          trip_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_technicians_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_technicians_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "trip_technicians_technician_fkey"
            columns: ["organization_id", "technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "trip_technicians_trip_fkey"
            columns: ["organization_id", "trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "trip_technicians_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_technicians_updated_by_membership_fkey"
            columns: ["organization_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
        ]
      }
      trip_overnights: {
        Row: {
          adjusted_at: string | null
          adjusted_by: string | null
          adjusted_overnights: number | null
          adjustment_reason: string | null
          calculated_for_travel_ends_at: string
          calculated_for_travel_starts_at: string
          calculated_overnights: number
          calculation_timezone: string
          created_at: string
          created_by: string
          id: string
          organization_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          revision: number
          trip_id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          adjusted_at?: string | null
          adjusted_by?: string | null
          adjusted_overnights?: number | null
          adjustment_reason?: string | null
          calculated_for_travel_ends_at: string
          calculated_for_travel_starts_at: string
          calculated_overnights: number
          calculation_timezone: string
          created_at?: string
          created_by: string
          id?: string
          organization_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision?: number
          trip_id: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          adjusted_at?: string | null
          adjusted_by?: string | null
          adjusted_overnights?: number | null
          adjustment_reason?: string | null
          calculated_for_travel_ends_at?: string
          calculated_for_travel_starts_at?: string
          calculated_overnights?: number
          calculation_timezone?: string
          created_at?: string
          created_by?: string
          id?: string
          organization_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision?: number
          trip_id?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_overnights_adjusted_by_fkey"
            columns: ["adjusted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_overnights_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_overnights_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_overnights_trip_fkey"
            columns: ["organization_id", "trip_id"]
            isOneToOne: true
            referencedRelation: "trips"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "trip_overnights_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_vehicle_assignments: {
        Row: {
          blocks_schedule: boolean
          created_at: string
          created_by: string
          driver_technician_id: string
          id: string
          notes: string | null
          occupancy_ends_at: string | null
          occupancy_starts_at: string | null
          organization_id: string
          trip_id: string
          updated_at: string
          updated_by: string
          vehicle_id: string
        }
        Insert: {
          blocks_schedule?: boolean
          created_at?: string
          created_by: string
          driver_technician_id: string
          id?: string
          notes?: string | null
          occupancy_ends_at?: string | null
          occupancy_starts_at?: string | null
          organization_id: string
          trip_id: string
          updated_at?: string
          updated_by: string
          vehicle_id: string
        }
        Update: {
          blocks_schedule?: boolean
          created_at?: string
          created_by?: string
          driver_technician_id?: string
          id?: string
          notes?: string | null
          occupancy_ends_at?: string | null
          occupancy_starts_at?: string | null
          organization_id?: string
          trip_id?: string
          updated_at?: string
          updated_by?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_vehicle_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_vehicle_assignments_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "trip_vehicle_assignments_driver_fkey"
            columns: ["organization_id", "trip_id", "driver_technician_id"]
            isOneToOne: false
            referencedRelation: "trip_technicians"
            referencedColumns: ["organization_id", "trip_id", "technician_id"]
          },
          {
            foreignKeyName: "trip_vehicle_assignments_trip_fkey"
            columns: ["organization_id", "trip_id"]
            isOneToOne: true
            referencedRelation: "trips"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "trip_vehicle_assignments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_vehicle_assignments_updated_by_membership_fkey"
            columns: ["organization_id", "updated_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "trip_vehicle_assignments_vehicle_fkey"
            columns: ["organization_id", "vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      trip_status_history: {
        Row: {
          changed_by: string
          created_at: string
          from_status: Database["public"]["Enums"]["trip_status"]
          id: string
          note: string | null
          occurred_at: string
          organization_id: string
          to_status: Database["public"]["Enums"]["trip_status"]
          trip_id: string
        }
        Insert: {
          changed_by: string
          created_at?: string
          from_status: Database["public"]["Enums"]["trip_status"]
          id?: string
          note?: string | null
          occurred_at?: string
          organization_id: string
          to_status: Database["public"]["Enums"]["trip_status"]
          trip_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["trip_status"]
          id?: string
          note?: string | null
          occurred_at?: string
          organization_id?: string
          to_status?: Database["public"]["Enums"]["trip_status"]
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_status_history_changed_by_membership_fkey"
            columns: ["organization_id", "changed_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "trip_status_history_trip_fkey"
            columns: ["organization_id", "trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      trips: {
        Row: {
          canceled_at: string | null
          canceled_by: string | null
          cancellation_reason: string | null
          client_id: string
          client_legal_name_snapshot: string
          client_name_snapshot: string
          client_trade_name_snapshot: string | null
          client_unit_id: string
          client_unit_name_snapshot: string
          code: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string
          description: string | null
          destination_city: string | null
          destination_state: string | null
          finished_at: string | null
          finished_by: string | null
          id: string
          notes: string | null
          organization_id: string
          origin_city: string | null
          origin_state: string | null
          priority: Database["public"]["Enums"]["trip_priority"]
          reason: string | null
          service_ends_at: string | null
          service_starts_at: string | null
          service_type_id: string | null
          status: Database["public"]["Enums"]["trip_status"]
          title: string
          travel_ends_at: string | null
          travel_starts_at: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          canceled_at?: string | null
          canceled_by?: string | null
          cancellation_reason?: string | null
          client_id: string
          client_legal_name_snapshot: string
          client_name_snapshot: string
          client_trade_name_snapshot?: string | null
          client_unit_id: string
          client_unit_name_snapshot: string
          code: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          destination_city?: string | null
          destination_state?: string | null
          finished_at?: string | null
          finished_by?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          origin_city?: string | null
          origin_state?: string | null
          priority?: Database["public"]["Enums"]["trip_priority"]
          reason?: string | null
          service_ends_at?: string | null
          service_starts_at?: string | null
          service_type_id?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          title: string
          travel_ends_at?: string | null
          travel_starts_at?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          canceled_at?: string | null
          canceled_by?: string | null
          cancellation_reason?: string | null
          client_id?: string
          client_legal_name_snapshot?: string
          client_name_snapshot?: string
          client_trade_name_snapshot?: string | null
          client_unit_id?: string
          client_unit_name_snapshot?: string
          code?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          destination_city?: string | null
          destination_state?: string | null
          finished_at?: string | null
          finished_by?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          origin_city?: string | null
          origin_state?: string | null
          priority?: Database["public"]["Enums"]["trip_priority"]
          reason?: string | null
          service_ends_at?: string | null
          service_starts_at?: string | null
          service_type_id?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          title?: string
          travel_ends_at?: string | null
          travel_starts_at?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_canceled_by_fkey"
            columns: ["canceled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_canceled_by_membership_fkey"
            columns: ["organization_id", "canceled_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "trips_client_fkey"
            columns: ["organization_id", "client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "trips_client_unit_fkey"
            columns: ["organization_id", "client_id", "client_unit_id"]
            isOneToOne: false
            referencedRelation: "client_units"
            referencedColumns: ["organization_id", "client_id", "id"]
          },
          {
            foreignKeyName: "trips_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_confirmed_by_membership_fkey"
            columns: ["organization_id", "confirmed_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "trips_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_finished_by_fkey"
            columns: ["finished_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_finished_by_membership_fkey"
            columns: ["organization_id", "finished_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "trips_created_by_membership_fkey"
            columns: ["organization_id", "created_by"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["organization_id", "profile_id"]
          },
          {
            foreignKeyName: "trips_organization_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_service_type_fkey"
            columns: ["organization_id", "service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["organization_id", "id"]
          },
          {
            foreignKeyName: "trips_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_updated_by_membership_fkey"
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
      cancel_trip: {
        Args: {
          p_cancellation_reason: string
          p_organization_id: string
          p_trip_id: string
        }
        Returns: boolean
      }
      confirm_trip: {
        Args: { p_organization_id: string; p_trip_id: string }
        Returns: boolean
      }
      adjust_trip_overnights: {
        Args: {
          p_adjusted_overnights: number
          p_adjustment_reason: string
          p_expected_revision: number
          p_organization_id: string
          p_trip_id: string
        }
        Returns: boolean
      }
      assign_trip_vehicle_and_driver: {
        Args: {
          p_driver_technician_id: string
          p_notes: string | null
          p_organization_id: string
          p_trip_id: string
          p_vehicle_id: string
        }
        Returns: boolean
      }
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
      ensure_trip_overnight_calculation: {
        Args: { p_organization_id: string; p_trip_id: string }
        Returns: number
      }
      link_technician_profile: {
        Args: {
          p_organization_id: string
          p_profile_id: string
          p_technician_id: string
        }
        Returns: boolean
      }
      list_trip_status_history: {
        Args: { p_organization_id: string; p_trip_id: string }
        Returns: {
          changed_by: string
          changed_by_name: string
          from_status: Database["public"]["Enums"]["trip_status"]
          id: string
          note: string | null
          occurred_at: string
          to_status: Database["public"]["Enums"]["trip_status"]
        }[]
      }
      list_my_operational_trips: {
        Args: {
          p_limit?: number
          p_organization_id: string
          p_trip_id?: string | null
        }
        Returns: {
          client_name: string
          client_unit_name: string
          code: string
          destination_city: string | null
          destination_state: string | null
          id: string
          is_responsible: boolean
          priority: Database["public"]["Enums"]["trip_priority"]
          service_ends_at: string | null
          service_starts_at: string | null
          status: Database["public"]["Enums"]["trip_status"]
          title: string
          travel_ends_at: string | null
          travel_starts_at: string | null
        }[]
      }
      mark_trip_as_planned: {
        Args: { p_organization_id: string; p_trip_id: string }
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
      remove_trip_vehicle_assignment: {
        Args: { p_organization_id: string; p_trip_id: string }
        Returns: boolean
      }
      restore_canceled_trip: {
        Args: { p_organization_id: string; p_trip_id: string }
        Returns: boolean
      }
      return_trip_to_draft: {
        Args: { p_organization_id: string; p_trip_id: string }
        Returns: boolean
      }
      reset_trip_overnight_adjustment: {
        Args: {
          p_expected_revision: number
          p_organization_id: string
          p_trip_id: string
        }
        Returns: boolean
      }
      replace_trip_required_skills: {
        Args: {
          p_organization_id: string
          p_requirements: Json
          p_trip_id: string
        }
        Returns: boolean
      }
      replace_trip_technicians: {
        Args: {
          p_organization_id: string
          p_technicians: Json
          p_trip_id: string
        }
        Returns: boolean
      }
      review_trip_overnights: {
        Args: {
          p_expected_revision: number
          p_organization_id: string
          p_trip_id: string
        }
        Returns: boolean
      }
      set_trip_responsible_technician: {
        Args: {
          p_organization_id: string
          p_technician_id: string | null
          p_trip_id: string
        }
        Returns: boolean
      }
      transition_trip_status: {
        Args: {
          p_note?: string | null
          p_organization_id: string
          p_target_status: Database["public"]["Enums"]["trip_status"]
          p_trip_id: string
        }
        Returns: boolean
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
      trip_priority: "low" | "normal" | "high" | "urgent"
      trip_status: "draft" | "planned" | "confirmed" | "traveling" | "at_client" | "in_service" | "returning" | "finished" | "canceled"
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
      trip_priority: ["low", "normal", "high", "urgent"],
      trip_status: ["draft", "planned", "confirmed", "traveling", "at_client", "in_service", "returning", "finished", "canceled"],
      vehicle_operational_status: ["available", "maintenance", "blocked"],
    },
  },
} as const

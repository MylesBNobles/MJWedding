export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      households: {
        Row: {
          id: string;
          household_name: string;
          side: 'jeslin' | 'myles' | 'both' | null;
          relationship_to_couple: string | null;
          invite_status: 'definite' | 'maybe' | 'not_invited';
          primary_guest_id: string | null;
          street_address: string | null;
          street_address_2: string | null;
          city: string | null;
          state_region: string | null;
          postal_code: string | null;
          country: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['households']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['households']['Insert']>;
      };
      guests: {
        Row: {
          id: string;
          household_id: string;
          title: string | null;
          first_name: string;
          last_name: string | null;
          suffix: string | null;
          guest_type: 'primary' | 'partner' | 'child' | 'adult' | 'plus_one';
          email: string | null;
          phone: string | null;
          invite_status: 'definite' | 'maybe' | 'not_invited';
          overall_rsvp_status: 'pending' | 'accepted' | 'declined' | 'maybe';
          is_named: boolean;
          plus_one_allowed: boolean;
          plus_one_guest_id: string | null;
          invited_by_guest_id: string | null;
          dietary_restrictions: string | null;
          notes: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['guests']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['guests']['Insert']>;
      };
      events: {
        Row: {
          id: string;
          name: string;
          slug: string;
          event_date: string | null;
          start_time: string | null;
          end_time: string | null;
          location_name: string | null;
          location_address: string | null;
          description: string | null;
          is_public: boolean;
          rsvp_required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
      guest_event_invitations: {
        Row: {
          id: string;
          guest_id: string;
          event_id: string;
          invited: boolean;
          rsvp_status: 'pending' | 'accepted' | 'declined' | 'maybe';
          meal_choice: string | null;
          dietary_restrictions: string | null;
          notes: string | null;
          responded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['guest_event_invitations']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['guest_event_invitations']['Insert']>;
      };
    };
  };
};

export type Household = Database['public']['Tables']['households']['Row'];
export type Guest = Database['public']['Tables']['guests']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type GuestEventInvitation = Database['public']['Tables']['guest_event_invitations']['Row'];

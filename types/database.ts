export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          role: 'USER' | 'PROVIDER' | 'ADMIN';
          name: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          role?: 'USER' | 'PROVIDER' | 'ADMIN';
          name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          role?: 'USER' | 'PROVIDER' | 'ADMIN';
          name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          provider_id: string;
          title: string;
          description: string;
          category: string;
          price: number;
          rating: number;
          rating_count: number;
          city: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          title: string;
          description: string;
          category: string;
          price: number;
          rating?: number;
          rating_count?: number;
          city?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          title?: string;
          description?: string;
          category?: string;
          price?: number;
          rating?: number;
          rating_count?: number;
          city?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'services_provider_id_fkey';
            columns: ['provider_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      availability: {
        Row: {
          id: string;
          provider_id: string;
          start_ts: string;
          end_ts: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          start_ts: string;
          end_ts: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          start_ts?: string;
          end_ts?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'availability_provider_id_fkey';
            columns: ['provider_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          provider_id: string;
          service_id: string;
          start_ts: string;
          end_ts: string;
          status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider_id: string;
          service_id: string;
          start_ts: string;
          end_ts: string;
          status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider_id?: string;
          service_id?: string;
          start_ts?: string;
          end_ts?: string;
          status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_provider_id_fkey';
            columns: ['provider_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_service_id_fkey';
            columns: ['service_id'];
            referencedRelation: 'services';
            referencedColumns: ['id'];
          }
        ];
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          user_id: string;
          service_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          user_id: string;
          service_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          user_id?: string;
          service_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_booking_id_fkey';
            columns: ['booking_id'];
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_service_id_fkey';
            columns: ['service_id'];
            referencedRelation: 'services';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

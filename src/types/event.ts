export interface Event {
  id: string;
  event_name: string;
  slug: string;
  landscape_poster: string;
  portrait_poster: string;
  date: string | null;
  time: string;
  duration: string;
  age_limit: string;
  event_type: string;
  language: string;
  category: string;
  venue: string;
  price: string;
  description: string;
  performers: string;
  creator_email: string;
  created_at: string;
  min_team_size?: number;
  max_team_size?: number;
  is_team_event?: boolean;
  registration_start?: string;
  registration_end?: string;
  result_date?: string;
  timeline?: Array<{
    title: string;
    date: string;
    time?: string;
    description?: string;
    status?: "completed" | "active" | "upcoming";
  }>;
  ppt_url?: string;
  ppt_title?: string;
  timeline_document?: {
    url: string;
    title: string;
    type: 'pdf' | 'ppt' | 'doc' | 'image';
  };
}

export interface Team {
  id: string;
  event_id: string;
  team_name: string;
  team_code: string;
  creator_email: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_email: string;
  joined_at: string;
}

export interface Booking {
  id: string;
  user_email: string;
  event_id: string;
  created_at?: string;
  createdAt?: string;
  event: Event;
  qrCodeToken?: string;
  teamName?: string;
  teamDetails?: Array<{ name: string; phone: string; isLeader?: boolean }>;
}

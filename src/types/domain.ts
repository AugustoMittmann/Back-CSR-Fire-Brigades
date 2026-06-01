/**
 * DB row shapes. Snake_case to mirror the actual columns. The repo layer is
 * responsible for converting these to API (camelCase) shapes via toCamel*.
 */

export interface BrigadeRow {
  id: string;
  name: string;
  description: string | null;
  presentation: string | null;
  email: string | null;
  phone_number: string | null;
  instagram: string | null;
  pix: string | null;
  acting_area: string | null;
  volunteers: number;
  foundation: string | null; // ISO date
  address: string | null;
  state: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  brigade_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  state: string | null;
  city: string | null;
  contact_reason: string;
  brigade_id: string | null;
  message: string;
  terms_accepted: boolean;
  created_at: string;
}

export interface CampaignRow {
  id: string;
  title: string;
  description: string | null;
  body: string | null;
  category: string | null;
  category_color: string | null;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  position: number;
  created_at: string;
  updated_at: string;
}

/**
 * DB row shapes. Snake_case to mirror the actual columns. The repo layer is
 * responsible for converting these to API (camelCase) shapes via toCamel*.
 */

export interface BrigadeRow {
  id: string;
  slug: string | null;
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
  external_code: string | null;
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
  slug: string | null;
  title: string;
  description: string | null;
  body: string | null;
  pix: string | null;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsRow {
  id: string;
  slug: string | null;
  title: string;
  subtitle: string | null;
  summary: string | null;
  body: string | null;
  author: string | null;
  source_url: string | null;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleRow {
  id: string;
  slug: string | null;
  title: string;
  subtitle: string | null;
  summary: string | null;
  body: string | null;
  author: string | null;
  category: 'Artigo' | 'Boas Práticas';
  image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemRow {
  id: string;
  name: string;
  default_value: number | null;
  unit: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemBrigadeRow {
  brigade_id: string;
  item_id: string;
  value: number | null;
  quantity_needed: number | null;
}

export interface ActivityRow {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityBrigadeRow {
  brigade_id: string;
  activity_id: string;
}

export interface ParticipantBrigadeRow {
  id: string;
  name: string;
  image_url: string | null;
  brigade_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignResultRow {
  id: string;
  campaign_id: string;
  label: string;
  value: string;
  position: number;
  created_at: string;
}

export interface EventRow {
  id: string;
  event_type: string;
  target_type: string | null;
  target_id: string | null;
  session_id: string | null;
  occurred_at: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  email: string;
  display_name: string | null;
  is_validated: boolean;
  validated_by: string | null;
  validated_at: string | null;
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

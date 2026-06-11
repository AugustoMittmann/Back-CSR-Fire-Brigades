import type { Request, Response } from 'express';
import {
  profileCreateSchema,
  profileListQuerySchema,
  profileUpdateSchema,
} from '../schemas/profile.js';
import {
  getProfile,
  listProfiles,
  revokeProfile,
  updateProfile,
  validateProfile,
} from '../db/profiles.js';
import { supabase } from '../db/supabase.js';
import { mapSupabaseError } from '../utils/supabaseError.js';
import { badRequest, unauthorized } from '../errors/HttpError.js';
import type { ProfileRow } from '../types/domain.js';

interface ProfileApi {
  id: string;
  email: string;
  displayName: string | null;
  role: 'user' | 'admin' | 'super_admin';
  isValidated: boolean;
  validatedBy: string | null;
  validatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const toApi = (r: ProfileRow): ProfileApi => ({
  id: r.id,
  email: r.email,
  displayName: r.display_name,
  role: r.role,
  isValidated: r.is_validated,
  validatedBy: r.validated_by,
  validatedAt: r.validated_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const list = async (req: Request, res: Response): Promise<void> => {
  const q = profileListQuerySchema.parse(req.query);
  const { data, count } = await listProfiles(q);
  res.json({
    data: data.map(toApi),
    limit: q.limit,
    offset: q.offset,
    ...(count !== null ? { count } : {}),
  });
};

/** Returns the calling user's own profile (no admin requirement). */
export const me = async (req: Request, res: Response): Promise<void> => {
  const sub = req.auth?.sub;
  if (!sub) throw unauthorized('missing_token', 'Unauthorized');
  const row = await getProfile(sub);
  res.json({ data: toApi(row) });
};

export const get = async (req: Request, res: Response): Promise<void> => {
  // ID here is an Auth0/Supabase Auth subject — not necessarily a UUID, so we
  // accept it as a free-form string but trim to a sane upper bound.
  const id = String(req.params.id ?? '').slice(0, 255);
  const row = await getProfile(id);
  res.json({ data: toApi(row) });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id ?? '').slice(0, 255);
  const patch = profileUpdateSchema.parse(req.body);
  const row = await updateProfile(id, patch);
  res.json({ data: toApi(row) });
};

export const validate = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id ?? '').slice(0, 255);
  const validatorId = req.auth?.sub;
  if (!validatorId) throw unauthorized('missing_token', 'Unauthorized');
  const row = await validateProfile(id, validatorId);
  res.json({ data: toApi(row) });
};

export const revoke = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id ?? '').slice(0, 255);
  const row = await revokeProfile(id);
  res.json({ data: toApi(row) });
};

/**
 * Admin-only: provisiona um novo usuário via Supabase Auth Admin API.
 * O trigger handle_new_user cria a row em profiles automaticamente; em seguida
 * aplicamos role/display_name e marcamos is_validated=true (admins criados
 * manualmente são pré-validados).
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const body = profileCreateSchema.parse(req.body);
  const validatorId = req.auth?.sub;
  if (!validatorId) throw unauthorized('missing_token', 'Unauthorized');

  const { data, error } = await supabase().auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
  });
  if (error) {
    // Erros típicos: email já em uso, senha fraca, etc. Repassamos como 400.
    throw badRequest('signup_failed', error.message);
  }
  if (!data.user) throw badRequest('signup_failed', 'Auth API returned no user');

  // Aplica role + display_name + is_validated. validateProfile registra
  // validated_by/validated_at; updateProfile cuida do resto.
  await updateProfile(data.user.id, {
    role: body.role ?? 'user',
    display_name: body.display_name,
  });
  const row = await validateProfile(data.user.id, validatorId);
  res.status(201).json({ data: toApi(row) });
};

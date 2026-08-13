/**
 * Augments the Express Request with our per-request context:
 *  - id       a UUID set by requestId middleware; echoed in `X-Request-Id`
 *  - auth     the decoded JWT payload after `requireAuth` succeeds
 *  - profile  the caller's validated profile, set by requireAdmin/
 *             requireSuperAdmin so controllers can make role-aware decisions
 *
 * Loaded automatically by the `include: ["src/**\/*"]` glob in tsconfig.
 */
import type { JwtPayload } from 'jsonwebtoken';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
      auth?: JwtPayload & { sub?: string };
      profile?: { role: 'user' | 'admin' | 'super_admin'; isValidated: boolean };
    }
  }
}

export {};

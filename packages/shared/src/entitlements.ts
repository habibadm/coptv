import type { AccessTier, Content, PlaybackDenied, User } from './types';

/**
 * Decide si un usuario (o un visitante sin cuenta) puede ver un contenido.
 * Devuelve null si puede, o el motivo por el que no.
 */
export function checkAccess(content: Pick<Content, 'access'>, user: User | null): PlaybackDenied | null {
  if (content.access === 'free') return null;
  if (!user) return { reason: 'login_required' };
  if (content.access === 'registered') return null;
  return hasTier(user, 'premium') ? null : { reason: 'subscription_required' };
}

function hasTier(user: User, tier: AccessTier): boolean {
  return user.entitlements.includes(tier);
}

import { describe, expect, it } from 'vitest';
import { checkAccess } from './entitlements';

const member = { id: 'u1', entitlements: [] };
const subscriber = { id: 'u2', entitlements: ['premium' as const] };

describe('checkAccess', () => {
  it('deja ver contenido gratis a cualquiera', () => {
    expect(checkAccess({ access: 'free' }, null)).toBeNull();
  });

  it('pide cuenta para contenido de registrados', () => {
    expect(checkAccess({ access: 'registered' }, null)).toEqual({ reason: 'login_required' });
    expect(checkAccess({ access: 'registered' }, member)).toBeNull();
  });

  it('pide suscripción para contenido premium', () => {
    expect(checkAccess({ access: 'premium' }, member)).toEqual({ reason: 'subscription_required' });
    expect(checkAccess({ access: 'premium' }, subscriber)).toBeNull();
  });
});

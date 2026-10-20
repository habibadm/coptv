import { createApiClient } from '@coptv/shared';

export const api = createApiClient(import.meta.env.VITE_API_URL ?? 'http://localhost:4000');

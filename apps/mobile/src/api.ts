import { createApiClient } from '@coptv/shared';
import Constants from 'expo-constants';

const apiUrl = (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://localhost:4000';

export const api = createApiClient(apiUrl);

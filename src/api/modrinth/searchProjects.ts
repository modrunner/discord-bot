import { request } from 'undici';
import logger from '../../logger.js';
import ApiCallManager from '../apiCallManager.js';

export async function searchProjects(query: string) {
  for (let i = 3; i > 0; i--) {
    ApiCallManager.trackCall('modrinth');
    try {
      return await request(`https://api.modrinth.com/v2/search?${new URLSearchParams({ query })}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'big7star/modrunner-bot/1.2.0 (modrunner.net)',
        },
      });
    } catch (error: any) {
      logger.error(`A ${error.name} has occurred while requesting data from Modrinth (Search Projects)`);
    }
  }
  return null;
}

import { request } from 'undici';
import logger from '../../logger.js';
import ApiCallManager from '../apiCallManager.js';
import { ResponseData } from 'undici/types/dispatcher.js';

export async function getProjects(projectIds: string[]): Promise<ResponseData | null> {
  for (let i = 3; i > 0; i--) {
    ApiCallManager.trackCall('modrinth');
    try {
      const formattedIds = projectIds.map((id) => '"' + id + '"');
      return await request(`https://api.modrinth.com/v2/projects?ids=[${formattedIds}]`, {
        method: 'GET',
        headers: {
          'user-agent': 'big7star/modrunner-bot/1.2.0 (modrunner.net)',
        },
      });
    } catch (error: any) {
      logger.error(`A ${error.name} has occurred while requesting data from Modrinth (Get Projects)`);
    }
  }
  return null;
}

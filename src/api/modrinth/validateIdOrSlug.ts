import { request } from 'undici';
import logger from '../../logger.js';
import ApiCallManager from '../apiCallManager.js';

export default async function validateIdOrSlug(idOrSlug: string) {
	for (let i = 3; i > 0; i--) {
		ApiCallManager.trackCall('modrinth');
		try {
			return await request(`https://api.modrinth.com/v2/project/${idOrSlug}/check`, {
				method: 'GET',
				headers: {
					'User-Agent': 'big7star/modrunner-bot/1.2.0 (modrunner.net)',
				},
			});
		} catch (error: any) {
			logger.error(`A ${ error.name } has occurred while requesting data from Modrinth (Validate ID or Slug)`);
		}
	}
	return null;
}

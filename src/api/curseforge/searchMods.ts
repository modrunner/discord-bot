import { request } from 'undici';
import logger from '../../logger.js';
import ApiCallManager from '../apiCallManager.js';

export default async function searchMods(query: string) {
	for (let i = 3; i > 0; i--) {
		ApiCallManager.trackCall('curseforge');
		try {
			return await request(`https://api.curseforge.com/v1/mods/search?gameId=432&searchFilter=${new URLSearchParams({ query })}`, {
				method: 'GET',
				headers: {
					'x-api-key': process.env.CF_API_KEY,
				},
			});
		} catch (error: any) {
			logger.debug(`A ${error.name} occurred while requesting data from CurseForge (Search Mods)`);
		}
	}
	return null;
}

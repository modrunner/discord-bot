import { request } from 'undici';
import logger from '../../logger.js';
import ApiCallManager from '../apiCallManager.js';

export async function getMods(modIds: number[]) {
	for (let i = 3; i > 0; i--) {
		ApiCallManager.trackCall('curseforge');
		try {
			return await request(`https://api.curseforge.com/v1/mods`, {
				body: JSON.stringify({ 'modIds': modIds }),
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': process.env.CF_API_KEY,
				},
			});
		} catch (error: any) {
			logger.debug(`A ${error.name} occurred while requesting data from CurseForge (Get Mods)`);
		}
	}
	return null;
}

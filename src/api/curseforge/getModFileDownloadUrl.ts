import { request } from 'undici';
import logger from '../../logger.js';
import ApiCallManager from '../apiCallManager.js';

export default async function getModFileDownloadUrl(modId: number, fileId: number) {
	for (let i = 3; i > 0; i--) {
		ApiCallManager.trackCall('curseforge');
		try {
			return await request(`https://api.curseforge.com/v1/mods/${modId}/files/${fileId}/download-url`, {
				method: 'GET',
				headers: {
					'x-api-key': process.env.CF_API_KEY,
				},
			});
		} catch (error: any) {
			logger.debug(`A ${error.name} occurred while requesting data from CurseForge (Get Mod File Download URL)`);
		}
	}
	return null;
}

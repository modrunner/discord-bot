const { api_max_retries, cf_base_url } = require('../constants');
const { request } = require('undici');
const logger = require('../../logger');
const { ApiCallManager } = require('../apiCallManager');

async function getModFileDownloadUrl(modId, fileId) {
	for (let i = api_max_retries; i > 0; i--) {
		ApiCallManager.trackCall('curseforge');
		try {
			const responseData = await request(`${cf_base_url}/mods/${modId}/files/${fileId}/download-url`, {
				method: 'GET',
				headers: {
					'x-api-key': process.env['CF_API_KEY'],
				},
			});
			return responseData;
		} catch (error) {
			logger.debug(`A ${error.name} occurred while requesting data from CurseForge (Get Mod File Download URL)`);
		}
	}
	return null;
}

module.exports = { getModFileDownloadUrl };
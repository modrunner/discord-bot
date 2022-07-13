const { cf_base_url, cf_api_key } = require('../api_config.json');
const { request } = require('undici');
const logger = require('../../logger');

module.exports = async (modId, fileId, maxAttempts) => {
	if (maxAttempts === 0) {
		logger.warn('Modrunner was unable to establish a connection to CurseForge\'s API.\nRequest type: Get Mod File Download URL');
		return null;
	}

	try {
		const responseData = await request(`${cf_base_url}/mods/${modId}/files/${fileId}/download-url`, {
			headers: {
				'x-api-key': cf_api_key,
			},
		});
		return responseData;
	} catch (error) {
		logger.info(`An ${error.name} occured while performing an API request to CurseForge.`);
		maxAttempts--;
		await this.getModFileDownloadUrl(modId, fileId, maxAttempts);
	}
};
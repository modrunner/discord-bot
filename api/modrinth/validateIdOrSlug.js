const { api_max_retries, modrinth_base_url, modrinth_user_agent } = require('../api_config.json');
const { request } = require('undici');
const logger = require('../../logger');
const { ApiCallManager } = require('../apiCallManager');

async function validateIdOrSlug(idOrSlug) {
	for (let i = api_max_retries; i > 0; i--) {
		ApiCallManager.trackCall('modrinth');
		try {
			const responseData = await request(`${modrinth_base_url}/project/${idOrSlug}/check`, {
				method: 'GET',
				headers: {
					'User-Agent': modrinth_user_agent,
				},
			});
			return responseData;
		} catch (error) {
			logger.error(`A ${ error.name } has occured while requesting data from Modrinth (Validate ID or Slug)`);
		}
	}
	return null;
}

module.exports = { validateIdOrSlug };
const { api_max_retries, modrinth_base_url, user_agent } = require('../constants');
const { request } = require('undici');
const logger = require('../../logger');
const { ApiCallManager } = require('../apiCallManager');

async function searchProjects(query) {
	for (let i = api_max_retries; i > 0; i--) {
		ApiCallManager.trackCall('modrinth');
		try {
			return await request(`${modrinth_base_url}/search?${new URLSearchParams({ query })}`, {
				method: 'GET',
				headers: {
					'User-Agent': user_agent,
				},
			});
		} catch (error) {
			logger.error(`A ${ error.name } has occurred while requesting data from Modrinth (Search Projects)`);
		}
	}
	return null;
}

module.exports = { searchProjects };
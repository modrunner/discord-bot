const { api_max_retries, modrinth_base_url, modrinth_user_agent } = require('../api_config.json');
const { request } = require('undici');
const logger = require('../../logger');
const { ApiCallManager } = require('../apiCallManager');

async function getProjects(projectIds) {
	for (let i = api_max_retries; i > 0; i--) {
		ApiCallManager.trackCall('modrinth');
		try {
			const formattedIds = projectIds.map(id => '"' + id + '"');
			const responseData = await request(`${modrinth_base_url}/projects?ids=[${formattedIds}]`, {
				method: 'GET',
				headers: {
					'user-agent': modrinth_user_agent,
				},
			});
			return responseData;
		} catch (error) {
			logger.error(`A ${ error.name } has occured while requesting data from Modrinth (Get Projects)`);
		}
	}
	return null;
}

module.exports = { getProjects };
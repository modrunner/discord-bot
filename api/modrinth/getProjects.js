const { api_max_retries, modrinth_base_url, user_agent } = require('../constants');
const { request } = require('undici');
const logger = require('../../logger');
const { ApiCallManager } = require('../apiCallManager');

async function getProjects(projectIds) {
	for (let i = api_max_retries; i > 0; i--) {
		ApiCallManager.trackCall('modrinth');
		try {
			const formattedIds = projectIds.map(id => '"' + id + '"');
			return await request(`${modrinth_base_url}/projects?ids=[${formattedIds}]`, {
				method: 'GET',
				headers: {
					'user-agent': user_agent,
				},
			});
		} catch (error) {
			logger.error(`A ${ error.name } has occurred while requesting data from Modrinth (Get Projects)`);
		}
	}
	return null;
}

module.exports = { getProjects };
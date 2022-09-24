const { api_max_retries, modrinth_base_url, user_agent } = require('../constants');
const { request } = require('undici');
const logger = require('../../logger');
const { ApiCallManager } = require('../apiCallManager');

async function getProject(projectId) {
	for (let i = api_max_retries; i > 0; i--) {
		ApiCallManager.trackCall('modrinth');
		try {
			return await request(`${modrinth_base_url}/project/${projectId}`, {
				method: 'GET',
				headers: {
					'user-agent': user_agent,
				},
			});
		} catch (error) {
			logger.error(`A ${ error.name } has occurred while requesting data from Modrinth (Get Project)`);
		}
	}
	return null;
}

module.exports = { getProject };
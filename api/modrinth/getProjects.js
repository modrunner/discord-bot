const { request } = require('undici');
const logger = require('../../logger');
const { ApiCallManager } = require('../apiCallManager');

async function getProjects(projectIds) {
	for (let i = 3; i > 0; i--) {
		ApiCallManager.trackCall('modrinth');
		try {
			const formattedIds = projectIds.map(id => '"' + id + '"');
			const responseData = await request(`https://api.modrinth.com/v2/projects?ids=[${formattedIds}]`, {
				method: 'GET',
				headers: {
					'user-agent': 'big7star/modrunner-bot/1.2.0 (modrunner.net)',
				},
			});
			return responseData;
		} catch (error) {
			logger.error(`A ${ error.name } has occurred while requesting data from Modrinth (Get Projects)`);
		}
	}
	return null;
}

module.exports = { getProjects };

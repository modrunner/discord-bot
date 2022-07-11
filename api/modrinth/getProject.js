const { modrinth_base_url, modrinth_user_agent } = require('../api_config.json');
const { request } = require('undici');
const logger = require('../../logger');

module.exports = async (id, maxAttempts) => {
	if (maxAttempts === 0) {
		logger.warn('A getProject API request to Modrinth has failed.');
		return null;
	}

	try {
		const responseData = await request(`${modrinth_base_url}/project/${id}`, {
			headers: {
				'User-Agent': modrinth_user_agent,
			},
		});
		return responseData;
	} catch (error) {
		logger.warn('An error occured while performing an API request to Modrinth.');
		logger.error(error);
		maxAttempts--;
		await this.getProject(id, maxAttempts);
	}
};
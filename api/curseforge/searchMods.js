const { cf_base_url, cf_api_key } = require('../api_config.json');
const { request } = require('undici');
const logger = require('../../logger');

module.exports = async (query, maxAttempts) => {
	if (maxAttempts === 0) {
		logger.warn('A searchMods API request to CurseForge has failed.');
		return null;
	}

	try {
		const responseData = await request(`${cf_base_url}/mods/search?gameId=432&searchFilter=${new URLSearchParams({ query })}`, {
			headers: {
				'x-api-key': cf_api_key,
			},
		});
		return responseData;
	} catch (error) {
		logger.warn('An error occured while performing an API request to CurseForge.');
		logger.error(error);
		maxAttempts--;
		await this.searchMods(query, maxAttempts);
	}
};
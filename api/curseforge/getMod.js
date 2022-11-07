const { request } = require('undici');
const logger = require('../../logger');
const { ApiCallManager } = require('../apiCallManager');

async function getMod(modId) {
	for (let i = 3; i > 0; i--) {
		ApiCallManager.trackCall('curseforge');
		try {
			const responseData = await request(`https://api.curseforge.com/v1/mods/${modId}`, {
				method: 'GET',
				headers: {
					'x-api-key': process.env.CF_API_KEY,
				},
			});
		} catch (error) {
			logger.info(`An ${error.name} has occurred while requesting data from CurseForge (Get Mod)`);
		}
	}
	return null;
}

module.exports = { getMod };

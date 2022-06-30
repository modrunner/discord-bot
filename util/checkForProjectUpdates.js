const { Projects } = require('../dbObjects');
const { getJSONResponse } = require('../util/getJSONResponse');
const { request } = require('undici');
const { sendUpdateMessage } = require('../util/sendUpdateMessage');
const { updatePresenceData } = require('../util/updatePresenceData');
const { cf_api_key, env } = require('../config.json');
const logger = require('../logger');

module.exports = {
	async checkForProjectUpdates(client) {
		logger.info('Checking for updates for projects in tracking...');

		const projects = await Projects.findAll();
		const guilds = client.guilds.cache.clone();

		updatePresenceData(client, projects.length);

		let isUpdateFound = false;

		for (const project of projects) {
			const projectPlatform = project.project_id.match(/[A-z]/) ? 'modrinth' : 'curseforge';

			let fetchedProject = null;
			switch (projectPlatform) {
			case 'curseforge': {
				try {
					const apiRequest = await request(`https://api.curseforge.com/v1/mods/${project.project_id}`, { headers: { 'x-api-key': cf_api_key } });
					fetchedProject = await getJSONResponse(apiRequest.body);
					fetchedProject = fetchedProject.data;
				} catch (error) {
					logger.warn(`An error occured while requesting data on ${project.project_title} (${project.project_id}) from CurseForge.`);
					logger.error(error);
					continue;
				}
				break;
			}
			case 'modrinth': {
				try {
					const apiRequest = await request(`https://api.modrinth.com/v2/project/${project.project_id}`);
					fetchedProject = await getJSONResponse(apiRequest.body);
				} catch (error) {
					logger.warn(`An error occured while requesting data on ${project.project_title} (${project.project_id}) from Modrinth.`);
					logger.error(error);
					continue;
				}
				break;
			}
			}

			const fetchedProjectLastUpdated = (projectPlatform === 'curseforge') ? fetchedProject.dateReleased : fetchedProject.updated;
			const fetchedProjectTitleName = (projectPlatform === 'curseforge') ? fetchedProject.name : fetchedProject.title;

			const fetchedProjectUpdatedDate = new Date(fetchedProjectLastUpdated);
			if (project.date_modified.getTime() === fetchedProjectUpdatedDate.getTime()) continue;

			logger.info(`Update detected for project: ${fetchedProjectTitleName}`);
			isUpdateFound = true;

			if (env === 'prod') {
				await Projects.update({ date_modified: fetchedProjectLastUpdated },
					{
						where: {
							project_id: fetchedProject.id,
						},
					});
			}

			for (let i = 0; i < guilds.size; i++) {
				const guild = guilds.at(i);
				if (guild.id === project.guild_id) {
					sendUpdateMessage(fetchedProject, guild, project.post_channel, projectPlatform);
				}
			}
		}

		if (!isUpdateFound) logger.info('No updates found.');
	},
};
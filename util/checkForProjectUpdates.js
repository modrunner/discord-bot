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

		async function fetchCurseForgeProject(project, fetchAttempts) {
			if (fetchAttempts > 10) {
				const channel = client.channels.cache.find(element => element.id === project.post_channel);
				channel.send(`⚠️ An error has occured while requesting data on ${project.project_title} (${project.project_id}) from CurseForge.\nIf this issue persists, please contact the developer of this application.`);
				return null;
			}

			try {
				fetchAttempts++;
				const apiRequest = await request(`https://api.curseforge.com/v1/mods/${project.project_id}`, { headers: { 'x-api-key': cf_api_key } });
				const fetchedProject = await getJSONResponse(apiRequest.body);
				return fetchedProject.data;
			} catch (error) {
				logger.warn(`An error occured while requesting data on ${project.project_title} (${project.project_id}) from CurseForge.`);
				logger.error(error);

				await fetchCurseForgeProject(project, client, fetchAttempts);
			}
		}

		async function fetchModrinthProject(project, fetchAttempts) {
			if (fetchAttempts > 10) {
				const channel = client.channels.cache.find(element => element.id === project.post_channel);
				channel.send(`⚠️ An error has occured while requesting data on ${project.project_title} (${project.project_id}) from Modrinth.\nIf this issue persists, please contact the developer of this application.`);
				return null;
			}

			try {
				fetchAttempts++;
				const apiRequest = await request(`https://api.modrinth.com/v2/project/${project.project_id}`);
				const fetchedProject = await getJSONResponse(apiRequest.body);
				return fetchedProject;
			} catch (error) {
				logger.warn(`An error occured while requesting data on ${project.project_title} (${project.project_id}) from Modrinth.`);
				logger.error(error);

				await fetchModrinthProject(project, client, fetchAttempts);
			}
		}

		for (const project of projects) {
			const projectPlatform = project.project_id.match(/[A-z]/) ? 'modrinth' : 'curseforge';

			let fetchedProject = null;
			switch (projectPlatform) {
			case 'curseforge': {
				fetchedProject = await fetchCurseForgeProject(project, client, 0);
				if (!fetchedProject) continue;
				break;
			}
			case 'modrinth': {
				fetchedProject = await fetchModrinthProject(project, client, 0);
				if (!fetchedProject) continue;
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
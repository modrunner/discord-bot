const { Projects } = require('../dbObjects');
const { sendUpdateMessage } = require('../util/sendUpdateMessage');
const { updatePresenceData } = require('../util/updatePresenceData');
const { env } = require('../config.json');
const { getMod, getProject } = require('../api/apiMethods');
const logger = require('../logger');
const getJSONResponse = require('../api/getJSONResponse');

module.exports = {
	async checkForProjectUpdates(client) {
		logger.debug('Checking for updates for projects in tracking...');

		const projects = await Projects.findAll();
		const guilds = client.guilds.cache.clone();

		updatePresenceData(client, projects.length);

		let isUpdateFound = false;

		async function fetchCurseForgeProject(project, fetchAttempts) {
			if (fetchAttempts > 3) {
				const channel = client.channels.cache.find(element => element.id === project.post_channel);
				channel.send(`⚠️ An error has occured while requesting data on ${project.project_title} (${project.project_id}) from CurseForge.\nIf this issue persists, please contact the developer of this application.`);
				return null;
			}

			const responseData = await getMod(project.project_id);
			fetchAttempts++;
			if (!responseData) await fetchCurseForgeProject(project, fetchAttempts);
			return responseData;
		}

		async function fetchModrinthProject(project, fetchAttempts) {
			if (fetchAttempts > 3) {
				const channel = client.channels.cache.find(element => element.id === project.post_channel);
				channel.send(`⚠️ An error has occured while requesting data on ${project.project_title} (${project.project_id}) from Modrinth.\nIf this issue persists, please contact the developer of this application.`);
				return null;
			}

			const responseData = await getProject(project.project_id);
			fetchAttempts++;
			if (!responseData) await fetchModrinthProject(project, fetchAttempts);
			return responseData;
		}

		for (const project of projects) {
			const projectPlatform = project.project_id.match(/[A-z]/) ? 'modrinth' : 'curseforge';

			let responseData = null;
			let fetchedProject = null;
			switch (projectPlatform) {
			case 'curseforge':
				responseData = await fetchCurseForgeProject(project, 0);
				if (!responseData) continue;
				fetchedProject = await getJSONResponse(responseData.body);
				fetchedProject = fetchedProject.data;
				break;
			case 'modrinth':
				responseData = await fetchModrinthProject(project, 0);
				if (!responseData) continue;
				fetchedProject = await getJSONResponse(responseData.body);
				break;
			}

			const fetchedProjectLastUpdated = (projectPlatform === 'curseforge') ? fetchedProject.dateReleased : fetchedProject.updated;
			const fetchedProjectTitleName = (projectPlatform === 'curseforge') ? fetchedProject.name : fetchedProject.title;

			const fetchedProjectUpdatedDate = new Date(fetchedProjectLastUpdated);
			if (project.date_modified.getTime() === fetchedProjectUpdatedDate.getTime()) continue;

			logger.info(`Update detected for project: ${fetchedProjectTitleName} (${fetchedProject.id})`);
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

		if (!isUpdateFound) logger.debug('No updates found.');
	},
};
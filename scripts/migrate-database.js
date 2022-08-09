const { trackProject } = require('../commands/track');
const { Projects } = require('../dbObjects');
const logger = require('../logger');
const wait = require('node:timers/promises').setTimeout;

(async () => {
	const oldProjects = await Projects.findAll();

	const failures = new Array;
	let migrated = 0;

	for (const project of oldProjects) {
		const trackRequest = await trackProject(project.project_id, project.post_channel, project.guild_id);

		if (!trackRequest.success) {
			failures.push(project);
			logger.warn(`Failed to migrate project ${project.project_title}`);
		} else {
			migrated++;
			logger.info(`${migrated}. Migrated project ${project.project_title}`);
		}

		await wait(1000);
	}
	logger.info(`Tracked Projects Database Migrated. Total projects migrated: ${migrated} | Total failures: ${failures.length}`);

	for (const failure of failures) {
		console.log(failure.title);
	}
})();
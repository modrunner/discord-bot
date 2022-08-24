const { TrackedProjects } = require('../dbObjects');

modifyDates();
async function modifyDates() {
	const projects = await TrackedProjects.findAll();

	for (const project of projects) {
		await TrackedProjects.update({
			date_updated: new Date('1970-01-01'),
			latest_file_id: null,
		}, {
			where: {
				id: project.id,
			},
		});
	}
}


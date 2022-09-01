const { TrackedProjects } = require('../dbObjects');

modifyFiles();
async function modifyFiles() {
	const projects = await TrackedProjects.findAll();

	for (const project of projects) {
		await TrackedProjects.update({
			latest_file_id: null,
		}, {
			where: {
				id: project.id,
			},
		});
	}
}
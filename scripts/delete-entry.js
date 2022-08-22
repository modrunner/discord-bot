const { TrackedProjects } = require('../dbObjects');
const logger = require('../logger');

(async () => {
	const removed = await TrackedProjects.destroy({
		where: {
			id: process.argv.at(2),
		},
	});

	logger.info(`Removed ${removed} from the database.`);
})();
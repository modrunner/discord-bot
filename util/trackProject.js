const { Projects } = require('../dbObjects');
const { classIdToString } = require('../util/classIdToString');
const { inlineCode } = require('@discordjs/builders');
const logger = require('../logger');


module.exports = {
	async trackCurseforgeProject(interaction, channel, project) {
		const [dbProject, created] = await Projects.findOrCreate({
			where: {
				project_id: project.data.id,
				guild_id: interaction.guild.id,
			},
			defaults: {
				project_id: project.data.id,
				project_type: classIdToString(project.data.classId),
				project_slug: project.data.slug,
				project_title: project.data.name,
				date_modified: project.data.dateReleased,
				guild_id: interaction.guild.id,
				post_channel: channel,
			},
		});

		if (created) {
			logger.info(`CurseForge project ${project.data.name} (${project.data.id}) was added to tracking for guild ${interaction.guild.name} (${interaction.guild.id})`);

			return interaction.reply(`CurseForge project **${dbProject.project_title}** has been added to tracking. Its updates will be posted to ${channel}.`);
		}

		return interaction.reply({ content: `CurseForge project ${dbProject.project_title} is already being tracked. If you wish to change this project's channel from ${channel}, untrack this project using the ${inlineCode('/untrack')} command and then re-track the project using the ${inlineCode('/track')} command.`, ephemeral: true });
	},

	async trackModrinthProject(interaction, channel, project) {
		const [dbProject, created] = await Projects.findOrCreate({
			where: {
				project_id: project.id,
				guild_id: interaction.guild.id,
			},
			defaults: {
				project_id: project.id,
				project_type: project.project_type,
				project_slug: project.slug,
				project_title: project.title,
				date_modified: project.updated,
				guild_id: interaction.guild.id,
				post_channel: channel,
			},
		});

		if (created) {
			logger.info(`Modrinth project ${project.title} (${project.id}) was added to tracking for guild ${interaction.guild.name} (${interaction.guild.id})`);

			return await interaction.reply(`Modrinth project **${dbProject.project_title}** has been added to tracking. Its updates will be posted to ${channel}.`);
		}

		return await interaction.reply({ content: `Modrinth project ${dbProject.project_title} is already being tracked. If you wish to change this project's channel from ${channel}, untrack this project using the ${inlineCode('/untrack')} command and then re-track the project using the ${inlineCode('/track')} command.`, ephemeral: true });
	},
};
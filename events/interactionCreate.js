const { PermissionsBitField, ApplicationCommandType, ComponentType, EmbedBuilder } = require('discord.js');
const getJSONResponse = require('../api/getJSONResponse');
const { inlineCode } = require('@discordjs/builders');
const { searchMods } = require('../api/curseforge');
const { searchProjects } = require('../api/modrinth');
const logger = require('../logger');
const { Projects, Guilds, TrackedProjects } = require('../database/db');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Slash command interactions
    if (interaction.commandType === ApplicationCommandType.ChatInput) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        command.execute(interaction);
      } catch (error) {
        logger.error(error);
        await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
      }
      // Button interactions
    } else if (interaction.componentType === ComponentType.Button) {
      if (interaction.customId.startsWith('track:')) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
          return await interaction.reply({ content: "You can only add projects to tracking if you have the 'Manage Channels' permission.", ephemeral: true });

        await interaction.deferReply();
        const projectId = interaction.customId.substring(6);
        const channel = interaction.guild.channels.cache.get(interaction.channel.id);

        // Fetch the project from the database
        // If the project isn't there, it calls the API and adds it
        const project = await Projects.fetch(projectId);
        if (!project) return await interaction.editReply(`:warning: No project exists with ID **${projectId}**.`);

        logger.info(`User ${interaction.user.tag} made a tracking request for project ${project.name} (${project.id}).`);

        // Find how many projects this guild is already tracking
        // If greater than the guild's max allowed tracked projects (usually 200), don't allow this project to be tracked
        const guildSettings = await Guilds.findByPk(interaction.guild.id);
        const currentlyTracked = await TrackedProjects.count({
          where: {
            guildId: interaction.guild.id,
          },
        });
        if (currentlyTracked >= guildSettings.maxTrackedProjects)
          return await interaction.editReply(':x: Your server has reached its maximum limit of tracked projects and cannot track any more.');

        // Track the project
        // This #track method returns an array with the model as the first element and a boolean indicating if a new entry
        // was created (tracking successful) as the second element
        const trackRequest = await project.track(interaction.guild.id, channel.id);
        if (!trackRequest[1]) return await interaction.editReply(`:warning: Project **${project.name}** is already tracked in ${channel}.`);

        return await interaction.editReply(`:white_check_mark: Project **${project.name}** tracked successfully. Its updates will be posted to ${channel}.`);
      } else if (interaction.customId.startsWith('more:')) {
        await interaction.deferReply();

        const query = interaction.customId.substring(5);
        const responseData = await searchProjects(query);
        if (!responseData) {
          const errorEmbed = new EmbedBuilder()
            .setColor('RED')
            .setDescription(
              '⚠️ A connection to Modrinth could not be established.\nIf this happens frequently, please contact the developer of this application.'
            )
            .setTimestamp();
          return await interaction.editReply({ embeds: [errorEmbed] });
        }

        const searchResults = await getJSONResponse(responseData.body);

        const resultsList = new EmbedBuilder()
          .setColor('DarkGreen')
          .setAuthor({ name: 'From modrinth.com', iconURL: 'https://i.imgur.com/2XDguyk.png', url: 'https://modrinth.com' })
          .setTitle(`Results for ${inlineCode(interaction.customId.substring(5))}`)
          .setDescription(`${searchResults.hits.length} total results`)
          .setFooter({ text: "NOTE: To see more than 25 results, or if you don't see what you're trying to find here, try searching on Modrinth's website." });

        for (let i = 0; i < searchResults.hits.length; i++) {
          if (i > 25) return interaction.editReply({ embeds: [resultsList] });

          resultsList.addFields({
            name: `${searchResults.hits[i].title}`,
            value: `[[View](https://modrinth.com/${searchResults.hits[i].project_type}/${searchResults.hits[i].slug})] ${searchResults.hits[i].project_type}, ${searchResults.hits[i].downloads} downloads`,
          });
        }

        return await interaction.editReply({ embeds: [resultsList] });
      } else if (interaction.customId.startsWith('cf_more:')) {
        await interaction.deferReply();

        const query = interaction.customId.substring(8);

        const responseData = await searchMods(query);
        if (!responseData) {
          const errorEmbed = new EmbedBuilder()
            .setColor('RED')
            .setDescription(
              '⚠️ A connection to CurseForge could not be established.\nIf this happens frequently, please contact the developer of this application.'
            )
            .setTimestamp();
          return await interaction.editReply({ embeds: [errorEmbed] });
        }

        const searchResults = await getJSONResponse(responseData.body);

        const resultsList = new EmbedBuilder()
          .setColor('#f87a1b')
          .setAuthor({ name: 'From curseforge.com', iconURL: 'https://i.imgur.com/uA9lFcz.png', url: 'https://curseforge.com' })
          .setTitle(`Results for ${inlineCode(interaction.customId.substring(8))}`)
          .setDescription(`${searchResults.data.length} total results`)
          .setFooter({
            text: "NOTE: To see more than 25 results, or if you don't see what you're trying to find here, try searching on CurseForge's website.",
          });

        let num = 0;
        for (let i = searchResults.data.length - 1; i >= 0; i--) {
          num++;
          if (num > 25) return interaction.editReply({ embeds: [resultsList] });

          resultsList.addFields({
            name: `${searchResults.data[i].name}`,
            value: `[[View](${searchResults.data[i].links.websiteUrl})] ${classIdToString(searchResults.data[i].classId)}, ${
              searchResults.data[i].downloadCount
            } downloads`,
          });
        }

        return await interaction.editReply({ embeds: [resultsList] });
      }
    }
  },
};

function classIdToString(classId) {
  switch (classId) {
    case 5:
      return 'Bukkit Plugin';
    case 6:
      return 'Mod';
    case 12:
      return 'Resource Pack';
    case 17:
      return 'World';
    case 4471:
      return 'Modpack';
    case 4546:
      return 'Customization';
    case 4559:
      return 'Addon';
    default:
      return 'Unknown';
  }
}

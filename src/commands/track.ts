import { ChannelType } from "discord-api-types/v10";
import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import logger from "../logger.js";
import { Projects, TrackedProjects, Guilds } from "../database/db.js";

export default {
  data: new SlashCommandBuilder()
    .setName("track")
    .setDescription("Track a Modrinth or CurseForge project and get notified when it gets updated.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .addStringOption((option) => option.setName("projectid").setDescription("The project's ID.").setRequired(true))
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel you want project update notifications posted to.")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const projectId = interaction.options.getString("projectid");
    const channel = interaction.options.getChannel("channel") ?? interaction.channel;

    await interaction.deferReply();

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
      return await interaction.editReply(":x: Your server has reached its maximum limit of tracked projects and cannot track any more.");

    // Track the project
    // This #track method returns an array with the model as the first element and a boolean indicating if a new entry
    // was created (tracking successful) as the second element
    const trackRequest = await project.track(interaction.guild.id, channel.id);
    if (!trackRequest[1]) return await interaction.editReply(`:warning: Project **${project.name}** is already tracked in ${channel}.`);

    return await interaction.editReply(`:white_check_mark: Project **${project.name}** tracked successfully. Its updates will be posted to ${channel}.`);
  },
};

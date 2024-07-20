import { ChannelType } from 'discord-api-types/v10'
import { ChatInputCommandInteraction, DMChannel, PermissionsBitField, SlashCommandBuilder } from 'discord.js'
import { logger } from '../logger.js'

export default {
  data: new SlashCommandBuilder()
    .setName('track')
    .setDescription('Track a Modrinth or CurseForge project and get notified when it gets updated.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .addStringOption((option) => option.setName('projectid').setDescription("The project's ID.").setRequired(true))
    .addStringOption((option) =>
      option
        .setName('platform')
        .setDescription("The project's platform.")
        .setRequired(true)
        .setChoices({ name: 'CurseForge', value: 'CurseForge' }, { name: 'Modrinth', value: 'Modrinth' })
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel you want project update notifications posted to.')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum)
    )
    .addRoleOption((option) => option.setName('role').setDescription('A role that you want to mention when this project sends an update notification.')),
  async execute(interaction: ChatInputCommandInteraction) {
    const projectId = interaction.options.getString('projectid')
    const platform = interaction.options.getString('platform')
    const channel = interaction.options.getChannel('channel') ?? interaction.channel
    const role = interaction.options.getRole('role')

    await interaction.deferReply()

    logger.info(`User ${interaction.user.username} made a tracking request for project with ID ${projectId} on ${platform}`)

    let result
    if (channel && projectId && platform) {
      if (channel.type === ChannelType.DM) {
        const body: TrackProjectBody = {
          project: {
            id: projectId,
            platform: platform,
          },
          discord: {
            channel: {
              id: channel.id,
            },
          },
        }

        const result = await fetch(`${process.env.MODRUNNER_API_KEY}/project`, {
          method: 'POST',
          body: JSON.stringify(body),
        })
      } else if (channel.type === ChannelType.GuildAnnouncement || channel.type === ChannelType.GuildForum || channel.type === ChannelType.GuildText) {
        const body: TrackProjectBody = {
          project: {
            id: projectId,
            platform: platform,
          },
          discord: {
            channel: {
              id: channel.id,
              name: channel.name ?? '',
							guild: {
								id: channel.guild.id,
								name: channel.guild.name,
							}
            },
          },
        }

        const result = await fetch(`${process.env.MODRUNNER_API_KEY}/project`, {
          method: 'POST',
          body: JSON.stringify(body),
        })
      }
    }

    // Track the project
    // This #track method returns an array with the model as the first element and a boolean indicating if a new entry
    // was created (tracking successful) as the second element
    const trackRequest = await project.track(interaction.guild.id, channel.id)
    const trackedProject = trackRequest[0]
    const created = trackRequest[1]
    if (!created) {
      if (role) {
        // Add the role to the tracked project
        await trackedProject.addRoles([role])
        return await interaction.editReply(`:white_check_mark: The role **${role.name}** will now be notified when this project receives updates.`)
      } else {
        return await interaction.editReply(`:warning: Project **${project.name}** is already tracked in ${channel}.`)
      }
    } else {
      if (role) {
        // Add the role to the tracked project
        await trackedProject.addRoles([role])
        return await interaction.editReply(
          `:white_check_mark: Project **${project.name}** tracked successfully. Its updates will be posted to ${channel}, and the role **${role.name}** will be notified.`
        )
      } else {
        return await interaction.editReply(`:white_check_mark: Project **${project.name}** tracked successfully. Its updates will be posted to ${channel}.`)
      }
    }
  },
}

interface TrackProjectBody {
  project: {
    id: string
    platform: string
  }
  discord?: {
    channel: {
      id: string
      name?: string
      guild?: {
        id: string
        name: string
      }
    }
  }
  webhook?: {}
}

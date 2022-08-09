const { SlashCommandBuilder, inlineCode } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const { GuildSettings } = require('../dbObjects');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mode')
		.setDescription('Set the display mode for project update notifications.')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
		.addStringOption(option =>
			option
				.setName('mode')
				.setDescription('The display mode to set.')
				.setRequired(true)
				.addChoices(
					{ name: 'Normal', value: 'normal' },
					{ name: 'Compact', value: 'lightweight' },
				),
		),
	async execute(interaction) {
		await interaction.deferReply();
		const mode = interaction.options.getString('mode');

		switch (mode) {
		case 'normal':
			await GuildSettings.update({ is_lightweight_mode_enabled: false }, {
				where: {
					guild_id: interaction.guild.id,
				},
			});
			return await interaction.editReply(`Display mode set to ${inlineCode('Normal')}.`);
		case 'lightweight':
			await GuildSettings.update({ is_lightweight_mode_enabled: true }, {
				where: {
					guild_id: interaction.guild.id,
				},
			});
			return await interaction.editReply(`Display mode set to ${inlineCode('Compact')}.`);
		}
	},
};
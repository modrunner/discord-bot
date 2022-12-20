import { ChatInputCommandInteraction } from 'discord.js';

export default (interaction: ChatInputCommandInteraction) => {
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		command.execute()
	}
}
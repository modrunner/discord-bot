const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const logger = require('../logger');

const commands = [];
const user_commands = [];
const message_commands = [];

const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    logger.info('Registering application commands...');

    if (process.argv.includes('--global') || process.argv.includes('-g')) {
      if (process.env.DOPPLER_ENVIRONMENT === 'dev') return logger.info('Global registration of commands is disabled in a developer workspace environment.');

      logger.info('Registering application commands globally across Discord...');
      await rest.put(Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID), { body: commands });
    } else {
      logger.info('Registering application commands to development guild...');
      if (!process.env.DISCORD_DEVELOPMENT_GUILD_ID) {
        logger.info('There is no defined development guild; cancelling registration.');
        process.exit(0);
      }
      await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_APPLICATION_ID, process.env.DISCORD_DEVELOPMENT_GUILD_ID), { body: commands });
    }

    logger.info(`Registered ${commands.length} CHAT_INPUT, ${user_commands.length} USER, and ${message_commands.length} MESSAGE commands.`);
  } catch (error) {
    logger.warn('An error occurred while registering application commands.');
    logger.error(error);
  }
})();

import fs from 'node:fs';
import { Client, GatewayIntentBits, Collection } from 'discord.js';

interface BotClient extends Client {
  commands: Collection<string, any>;
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
}) as BotClient;

client.commands = new Collection<string, any>();
const commandFiles = fs.readdirSync('./src/commands').filter((file) => file.endsWith('.ts'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./src/events').filter((file) => file.endsWith('.ts'));

for (const file of eventFiles) {
  const event = await import(`./src/events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

await client.login(process.env.DISCORD_TOKEN);
console.log('done');

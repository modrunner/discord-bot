import fs from 'node:fs';
import { Client, GatewayIntentBits, Collection, ClientOptions } from 'discord.js';

class BotClient extends Client {
	public commands: Collection<string, any> | null;
	public constructor(options: ClientOptions) {
		super(options);
		this.commands = null;
	}
}

const client = new BotClient({
	intents: [
		GatewayIntentBits.Guilds,
	],
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = await import(`./src/commands/${file}`);
	client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = await import(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

await client.login(process.env.DISCORD_TOKEN);

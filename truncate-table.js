const { GuildSettings, Projects } = require('./dbObjects');

console.log(`Argv[2] is ${process.argv[2]}`);
const arg = `${process.argv[2]}`;
fuckingdoshit();
async function fuckingdoshit() {
	switch (arg) {
	case 'projects':
		await Projects.destroy({
			truncate: true,
		});
		return console.log('Projects table truncated.');
	case 'guildsettings':
		await GuildSettings.destroy({
			truncate: true,
		});
		return console.log('GuildSettings table truncated.');
	}
}

const { Projects } = require('./../dbObjects');
const { request } = require('undici');
const { MessageEmbed } = require('discord.js');
const Project = require('../models/Project');

module.exports = {
	name: 'ready',
	async execute(client) {
		console.log(`Bot online, logged in as ${client.user.tag}`);

		// 15m = 900,000ms
		setInterval(doUpdateCheck, 900000);

		async function doUpdateCheck() {

			const projects = await Projects.findAll();
			const guilds = client.guilds.cache;

			for (const project of projects) {
				const apiRequest = await request(`https://api.modrinth.com/v2/project/${project.project_id}`);
				const fetchedProject = await getJSONResponse(apiRequest.body);

				if (project.date_modified === fetchedProject.updated) return;

				console.log(`Update detected for ${fetchedProject.title}`);
				await Project.update({
					date_modified: fetchedProject.updated,
					where: {
						project_id: fetchedProject.id,
					},
				});

				for (const guild of guilds) {
					if (guild.id === project.guild_id) {
						sendUpdateMessage(project, fetchedProject, guild);
					}
				}
			}
		}

		async function sendUpdateMessage(project, fetchedProject, guild) {
			const update = new MessageEmbed()
				.setColor('DARK_GREEN')
				.setTitle(fetchedProject.title)
				.setDescription(`A new version is available for ${fetchedProject.title}.`)
				.setFields(
					{ name: 'New Version', value: 'new version number goes here but that requires another api request and it\'s really late so fuck that rn' },
				)
				.setTimestamp();
			await guild.channels.cache.find(element => element.id === project.post_channel).send({ embeds: [ update ] });
		}

		async function getJSONResponse(body) {
			let fullBody = '';

			for await (const data of body) {
				fullBody += data.toString();
			}

			return JSON.parse(fullBody);
		}
	},
};
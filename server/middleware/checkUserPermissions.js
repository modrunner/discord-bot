const { PermissionsBitField } = require('discord.js');

const middleware = async (request, response, next) => {
  if (!request.body.guildId || !request.body.userId) {
    return response.status(400).json({
      error: 'A guild and/or user ID was not provided with this request',
    });
  }

  const guild = request.app.locals.client.guilds.cache.get(request.body.guildId);
  if (!guild) return response.status(404).json({ error: 'Guild not found' });
  const member = await guild.members.fetch(request.body.userId);
  if (!member) return response.status(404).json({ error: 'Member not found' });

  if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
    return response.status(401).json({
      error: 'You are not authorized to use this route',
    });
  }
  next();
};

module.exports = middleware;

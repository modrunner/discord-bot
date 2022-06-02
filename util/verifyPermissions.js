module.exports = {
	verifyMemberPermission(permission, guildMember) {
		if (guildMember.permissions.has(permission)) return true;
		return false;
	},
	verifyRolePermission(permission, role) {
		if (role.permissions.has(permission)) return true;
		return false;
	},
};
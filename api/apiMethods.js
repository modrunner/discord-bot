const { getMod } = require('../api/curseforge/getMod');
const { getModFileDownloadUrl } = require('../api/curseforge/getModFileDownloadUrl');
const { searchMods } = require('../api/curseforge/searchMods');

const { getProject } = require('../api/modrinth/getProject');
const { listProjectVersions } = require('../api/modrinth/listProjectVersions');
const { searchProjects } = require('../api/modrinth/searchProjects');

module.exports = { getMod, getModFileDownloadUrl, searchMods, getProject, listProjectVersions, searchProjects };
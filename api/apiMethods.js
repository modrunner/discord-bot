const { getMod } = require('../api/curseforge/getMod');
const { getModFileChangelog } = require('../api/curseforge/getModFileChangelog');
const { getModFileDownloadUrl } = require('../api/curseforge/getModFileDownloadUrl');
const { getMods } = require('../api/curseforge/getMods');
const { searchMods } = require('../api/curseforge/searchMods');

const { getProject } = require('../api/modrinth/getProject');
const { getProjects } = require('../api/modrinth/getProjects');
const { listProjectVersions } = require('../api/modrinth/listProjectVersions');
const { searchProjects } = require('../api/modrinth/searchProjects');
const { validateIdOrSlug } = require('../api/modrinth/validateIdOrSlug');

module.exports = {
  getMod,
  getModFileChangelog,
  getModFileDownloadUrl,
  getMods,
  searchMods,
  getProject,
  getProjects,
  listProjectVersions,
  searchProjects,
  validateIdOrSlug,
};

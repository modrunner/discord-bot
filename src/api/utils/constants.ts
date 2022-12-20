import { Agent } from 'undici';
import { RestClientOptions } from '../RestClient.js';
import { version } from '../../../package.json';

export const DefaultUserAgent = `smcmo/modrunner-bot/${version} (modrunner.net)`;

export const DefaultRestClientOptions: Required<RestClientOptions> = {
  get agent() {
    return new Agent({
      connect: {
        timeout: 30_000,
      },
    });
  },
  api: `https://api.curseforge.com`,
  headers: {},
  key: null,
  offset: 50,
  retries: 3,
  version: '1',
};

export const CurseforgeRoutes = {
  modsSearch() {
    return '/mods/search' as const;
  },
  modsFilesChangelog(modId: string, fileId: string) {
    return `/mods/${modId}/files/${fileId}/changelog` as const;
  },
  modsFilesDownloadUrl(modId: string, fileId: string) {
    return `/mods/${modId}/files/${fileId}/download-url` as const;
  },
  mods() {
    return '/mods' as const;
  },
  mod(modId: string) {
    return `/mods/${modId}` as const;
  },
};

export const ModrinthRoutes = {
  project(projectId: string) {
    return `/projects/${projectId}` as const;
  },
  projects() {
    return `/projects` as const;
  },
  projectVersion(projectId: string) {
    return `/project/${projectId}/version` as const;
  },
  search() {
    return `/search` as const;
  },
  projectCheck(projectId: string) {
    return `/project/${projectId}/check` as const;
  },
};

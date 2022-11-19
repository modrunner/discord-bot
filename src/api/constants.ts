import { version } from '../../package.json';

export const curseforge = {
  api_max_retries: 3,
  cf_base_url: 'https://api.curseforge.com/v1',
};

export const modrinth = {
  api_max_retries: 3,
  baseUrl: 'https://api.modrinth.com/v2',
  userAgent: `smcmo/modrunner-bot/${VERSION} (modrunner.net)`,
  version: 2,
};

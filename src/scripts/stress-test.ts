import { request } from 'undici';
import { setTimeout } from 'timers/promises';

const ids = [];

const searchResults = await request(`https://api.modrinth.com/v2/search?limit=100`);
const data = await searchResults.body.json();
for (const hit of data.hits) {
  ids.push(hit.project_id);
}

await test(ids, 0);

async function test(ids: string[], offset: number) {
  const searchResults = await request(`https://api.modrinth.com/v2/search?limit=100&offset=${offset}`);
  const data = await searchResults.body.json();
  for (const hit of data.hits) {
    ids.push(hit.project_id);
  }

  const formattedIds = ids.map(id => '"' + id + '"');
  const projectsResults = await request(`https://api.modrinth.com/v2/projects?ids=[${formattedIds}]`);
  const projects = await getJSONResponse(projectsResults.body);
  if (projectsResults.statusCode !== 200 || projects.length < offset + 100 || offset >= 10000) {
    return console.log(`Test concluded. Results:
      Status code: ${projectsResults.statusCode}
      Offset: ${offset},
      Returned projects: ${projects.length} (should be 100 more than offset)
    `);
  } else {
    offset += 100;
    console.log(`Passed. Continuing at offset ${offset}...`);
    await setTimeout(3000);
    await test(ids, offset);
  }
}

async function getJSONResponse(body: any) {
  let fullBody = '';

  for await (const data of body) {
    fullBody += data.toString();
  }

  let parsedJson;
  try {
    parsedJson = JSON.parse(fullBody);
  } catch (e) {
    console.log(e);
    console.log(fullBody);
  }

  return parsedJson;
}

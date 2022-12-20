import { CurseforgeProject, ModrinthProject, PrismaClient } from '@prisma/client';
import { getMod, getProject, validateIdOrSlug } from './api/RestClient.js';
import getJSONResponse from './api/getJSONResponse.js';

export const database = new PrismaClient();

export async function fetchProject(projectId: string): Promise<CurseforgeProject | ModrinthProject | null> {
  if (projectId.match(/[A-z]/)) {
    const validationResponse = await validateIdOrSlug(projectId);
    if (!validationResponse) return null;
    if (validationResponse.statusCode !== 200) return null;

    const validatedData = await getJSONResponse(validationResponse.body);
    const validatedId = validatedData.id;

    const project = await database.modrinthProject.findUnique({
      where: {
        id: validatedId,
      },
    });
    if (project) return project;

    const response = await getProject(validatedId);
    if (!response) return null;
    if (response.statusCode !== 200) return null;

    const data = await getJSONResponse(response.body);
    return await database.modrinthProject.create({
      data: {
        id: data.id,
        name: data.title,
        dateUpdated: data.updated,
        // need to verify modrinth fixed this and this can work
        latestFileId: data.versions[0],
      },
    });
  } else {
    const project = await database.curseforgeProject.findUnique({
      where: {
        id: projectId,
      },
    });
    if (project) return project;

    const response = await getMod(projectId);
    if (!response) return null;
    if (response.statusCode !== 200) return null;

    const { data } = await getJSONResponse(response.body);
    return await database.curseforgeProject.create({
      data: {
        id: data.id,
        name: data.name,
        dateUpdated: data.dateReleased,
        // do checks to make sure this shit exists
        latestFileId: data.latestFilesIndexes[data.latestFilesIndexes.length - 1],
        secondLatestFileId: data.latestFilesIndexes[data.latestFilesIndexes.length - 2],
      },
    });
  }
}

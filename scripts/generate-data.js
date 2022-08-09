const { request } = require('undici');
const getJSONResponse = require('../api/getJSONResponse');
const { Projects } = require('../dbObjects');

func();
async function func() {
	const responseData = await request('https://api.modrinth.com/v2/search?limit=100');
	const data = await getJSONResponse(responseData.body);

	for (let i = 0; i < data.hits.length; i++) {
		await Projects.create({
			project_id: data.hits[i].project_id,
			project_type: data.hits[i].project_type,
			project_slug: data.hits[i].slug,
			project_title: data.hits[i].title,
			date_modified: data.hits[i].date_modified,
			guild_id: '899777347400650854',
			post_channel: '976354991054938144',
		});
	}
}

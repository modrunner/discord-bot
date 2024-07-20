import express from 'express'
import { logger } from '../../logger.js'

export const stats = express.Router()

stats.route('/stats').get(async (request, response) => {
  const res = await fetch(`${process.env.ENGINE_API_URL}/project_count`).catch((error) => logger.error(error))
	let count = 0
	if (res && res.ok) {
		const json = await res.json() as { count: number }
		count = json.count
	}

  if (process.env.DOPPLER_ENVIRONMENT) {
    const res = await fetch(
      `https://uptime.betterstack.com/api/v2/status-pages/${process.env.BETTERSTACK_STATUS_PAGE_ID}/resources/${process.env.BETTERSTACK_RESOURCE_ID}`,
      {
        headers: {
          authorization: `Bearer ${process.env.BETTERSTACK_API_KEY}`,
        },
      }
    ).catch((error) => logger.error(error))

    if (res && res.ok) {
      const uptime = (await res.json()) as Uptime

      return response.status(200).json({
        servers: request.app.locals.client.guilds.cache.size,
        projects: count,
        uptime: uptime.data.attributes.availability,
      })
    }
  } else {
    return response.status(200).json({
      servers: request.app.locals.client.guilds.cache.size,
      projects: count,
      uptime: 0.0,
    })
  }
})

interface Uptime {
  data: {
    attributes: {
      availability: number
    }
  }
}

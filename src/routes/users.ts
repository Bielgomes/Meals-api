import { FastifyInstance } from 'fastify'

import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const getUsersBodySchema = z.object({
      name: z.string(),
    })

    const { name } = getUsersBodySchema.parse(request.body)

    const sessionId = randomUUID()

    reply.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    await knex('users').insert({
      id: randomUUID(),
      name,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}

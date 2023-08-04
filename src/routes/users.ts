import { FastifyInstance } from 'fastify'

import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
    })

    const { name, email, password } = createUserBodySchema.parse(request.body)

    const sessionId = randomUUID()

    reply.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.post('/sessions', async (request, reply) => {
    const sessionBodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    })

    const { email, password } = sessionBodySchema.parse(request.body)

    const user = await knex('users').where('email', email).first()

    if (user?.password !== password) {
      return reply.status(401).send()
    }

    const sessionId = randomUUID()

    reply.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    await knex('users')
      .update({
        session_id: sessionId,
      })
      .where('email', email)

    return reply.status(200).send()
  })
}

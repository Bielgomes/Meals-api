import { FastifyInstance } from 'fastify'
import { knex } from '../database'

import { z } from 'zod'

import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { randomUUID } from 'crypto'
import { findLongestSequence } from '../scripts/find-longest-sequence'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      const meals = await knex('meals').where('user_id', user.id).select()

      return { meals }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealsParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      const meal = await knex('meals')
        .where({
          user_id: user.id,
          id,
        })
        .select()
        .first()

      return { meal }
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      const totalMeals = await knex('meals')
        .where('user_id', user.id)
        .count('id as total')
        .first()

      const OnDietMeals = await knex('meals')
        .where({ user_id: user.id, type: 'on_diet' })
        .count('id as total')
        .first()

      const OffDietMeals = await knex('meals')
        .where({ user_id: user.id, type: 'off_diet' })
        .count('id as total')
        .first()

      const onDietMealsSequence = await knex('meals')
        .where('user_id', user.id)
        .orderBy('time')

      const longestOnDietMealsSequence = findLongestSequence(
        onDietMealsSequence,
        'on_diet',
      ).length

      reply.send({
        totalMeals,
        OnDietMeals,
        OffDietMeals,
        longestOnDietMealsSequence,
      })
    },
  )

  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        name: z.string(),
        description: z.string(),
        type: z.enum(['on_diet', 'off_diet']),
        time: z.string().datetime().optional(),
      })

      const params = getMealsParamsSchema.parse(request.body)

      const { sessionId } = request.cookies

      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      await knex('meals').insert({
        id: randomUUID(),
        user_id: user.id,
        ...params,
      })

      reply.status(201).send()
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const putMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const putMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(['on_diet', 'off_diet']).optional(),
        time: z.string().datetime().optional(),
      })

      const { sessionId } = request.cookies

      const { id } = putMealParamsSchema.parse(request.params)

      const body = putMealBodySchema.parse(request.body)

      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      await knex('meals')
        .update({ ...body })
        .where({
          user_id: user.id,
          id,
        })

      reply.status(201).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const deleteMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = deleteMealParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      await knex('meals')
        .where({
          user_id: user.id,
          id,
        })
        .delete()

      reply.status(202).send()
    },
  )
}

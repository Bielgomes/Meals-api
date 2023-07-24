import { fastify } from 'fastify'
import { fastifyCookie } from '@fastify/cookie'

import { mealsRoutes } from './routes/meals'
import { usersRoutes } from './routes/users'

export const app = fastify()

app.register(fastifyCookie)

app.register(usersRoutes, {
  prefix: '/users',
})

app.register(mealsRoutes, {
  prefix: '/meals',
})

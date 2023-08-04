import { it, beforeEach, beforeAll, afterAll, describe, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Users routes', () => {
  beforeAll(async () => {
    app.ready()
  })

  afterAll(async () => {
    app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Bielgomes',
        email: 'bielgomesdasilva@hotmail.com',
        password: '123456',
      })
      .expect(201)
  })

  it('should be able to authenticate', async () => {
    await request(app.server).post('/users').send({
      name: 'Bielgomes',
      email: 'bielgomesdasilva@hotmail.com',
      password: '123456',
    })

    const response = await request(app.server).post('/users/sessions').send({
      email: 'bielgomesdasilva@hotmail.com',
      password: '123456',
    })

    expect(response.statusCode).toEqual(200)
    expect(response.get('Set-Cookie')).toEqual([
      expect.stringContaining('sessionId='),
    ])
  })
})

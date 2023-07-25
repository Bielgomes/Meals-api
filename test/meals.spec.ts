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

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Bielgomes' })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'X Burguer',
      description: 'Dia do Lixo',
      type: 'off_diet',
      time: '2023-07-24T19:09:32Z',
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'X Burguer',
        description: 'Dia do Lixo',
        type: 'off_diet',
        time: '2023-07-24T19:09:32Z',
      }),
    ])
  })

  it('should be able to edit a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Bielgomes' })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'X Burguer',
      description: 'Dia do Lixo',
      type: 'off_diet',
      time: '2023-07-24T19:09:32Z',
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'X Burguer lite',
        description: 'Hamburguer Lite',
        type: 'on_diet',
        time: '2023-07-25T19:09:32Z',
      })

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'X Burguer lite',
        description: 'Hamburguer Lite',
        type: 'on_diet',
        time: '2023-07-25T19:09:32Z',
      }),
    )
  })

  it('should be able to delete a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Bielgomes' })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'X Burguer',
      description: 'Dia do Lixo',
      type: 'off_diet',
      time: '2023-07-24T19:09:32Z',
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(202)
  })

  it('should be able to list all meals', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Bielgomes' })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Maçã',
      description: 'Feira do joão',
      type: 'on_diet',
      time: '2023-07-24T19:09:32Z',
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Maçã',
        description: 'Feira do joão',
        type: 'on_diet',
        time: '2023-07-24T19:09:32Z',
      }),
    ])
  })

  it('should be able to get a specific meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Bielgomes' })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'X Burguer',
      description: 'Dia do Lixo',
      type: 'off_diet',
      time: '2023-07-24T19:09:32Z',
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = listMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'X Burguer',
        description: 'Dia do Lixo',
        type: 'off_diet',
        time: '2023-07-24T19:09:32Z',
      }),
    )
  })

  it('should be able to get a user meal metrics', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'Bielgomes' })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'X Burguer',
      description: 'Dia do Lixo',
      type: 'off_diet',
      time: '2023-07-24T19:09:32Z',
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Salada',
      description: 'Fitness',
      type: 'on_diet',
      time: '2023-07-24T19:09:32Z',
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Salada',
      description: 'Fitness',
      type: 'on_diet',
      time: '2023-07-24T19:09:32Z',
    })

    const getUserMetrics = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies)

    expect(getUserMetrics.body).toEqual({
      totalMeals: { total: 3 },
      OnDietMeals: { total: 2 },
      OffDietMeals: { total: 1 },
      longestOnDietMealsSequence: 2,
    })
  })
})

// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id: string
      name: string
    }
    meals: {
      id: string
      user_id: string
      name: string
      description: string
      type: 'on_diet' | 'off_diet'
      time: string
    }
  }
}

import {defineConfig} from 'prisma/config'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({
  path: path.resolve(__dirname, '.env'),
})

const connectionString = process.env.DATABASE_URL!

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  datasource: {
    url: connectionString,
  },
  migrations: {
    seed: 'node prisma/seed.js',
  },
  migrate: {
    adapter: async () => {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      return new PrismaPg({ connectionString })
    },
  },
})
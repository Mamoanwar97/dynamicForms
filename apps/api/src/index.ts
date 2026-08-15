import Fastify from 'fastify'
import cors from '@fastify/cors'
import { closeDb, connectDb } from './db.js'
import { itemsRoutes } from './routes/items.js'

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? true,
})

app.get('/', async () => {
  return { hello: 'world' }
})

app.get('/health', async () => {
  return { ok: true }
})

await app.register(itemsRoutes)

const start = async () => {
  try {
    await connectDb()
    app.log.info('Connected to MongoDB')

    const port = Number(process.env.PORT) || 3000
    await app.listen({ port, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

const shutdown = async () => {
  await app.close()
  await closeDb()
  process.exit(0)
}

process.on('SIGINT', () => {
  void shutdown()
})
process.on('SIGTERM', () => {
  void shutdown()
})

start()

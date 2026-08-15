import Fastify from 'fastify'
import cors from '@fastify/cors'

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

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000
    await app.listen({ port, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()

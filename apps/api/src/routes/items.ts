import type { FastifyInstance } from 'fastify'
import { ObjectId, type WithId, type Document } from 'mongodb'
import { getDb } from '../db.js'

type ItemBody = {
  title?: unknown
  description?: unknown
}

function serialize(doc: WithId<Document>) {
  const { _id, ...rest } = doc
  return { id: _id.toHexString(), ...rest }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export async function itemsRoutes(app: FastifyInstance) {
  const collection = () => getDb().collection('items')

  app.get('/items', async () => {
    const docs = await collection().find().sort({ createdAt: -1 }).toArray()
    return docs.map(serialize)
  })

  app.get<{ Params: { id: string } }>('/items/:id', async (req, reply) => {
    const { id } = req.params
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({ error: 'Invalid id' })
    }

    const doc = await collection().findOne({ _id: new ObjectId(id) })
    if (!doc) {
      return reply.status(404).send({ error: 'Not found' })
    }

    return serialize(doc)
  })

  app.post<{ Body: ItemBody }>('/items', async (req, reply) => {
    const { title, description } = req.body ?? {}
    if (!isNonEmptyString(title)) {
      return reply.status(400).send({ error: 'title is required' })
    }

    const now = new Date()
    const doc = {
      title: title.trim(),
      description: isNonEmptyString(description) ? description.trim() : '',
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection().insertOne(doc)
    return reply.status(201).send(serialize({ _id: result.insertedId, ...doc }))
  })
    

  app.put<{ Params: { id: string }; Body: ItemBody }>('/items/:id', async (req, reply) => {
    const { id } = req.params
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({ error: 'Invalid id' })
    }

    const { title, description } = req.body ?? {}
    const update: Record<string, unknown> = { updatedAt: new Date() }

    if (title !== undefined) {
      if (!isNonEmptyString(title)) {
        return reply.status(400).send({ error: 'title must be a non-empty string' })
      }
      update.title = title.trim()
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return reply.status(400).send({ error: 'description must be a string' })
      }
      update.description = description.trim()
    }

    if (Object.keys(update).length === 1) {
      return reply.status(400).send({ error: 'No fields to update' })
    }

    const result = await collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' },
    )

    if (!result) {
      return reply.status(404).send({ error: 'Not found' })
    }

    return serialize(result)
  })

  app.delete<{ Params: { id: string } }>('/items/:id', async (req, reply) => {
    const { id } = req.params
    if (!ObjectId.isValid(id)) {
      return reply.status(400).send({ error: 'Invalid id' })
    }

    const result = await collection().deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) {
      return reply.status(404).send({ error: 'Not found' })
    }

    return reply.status(204).send()
  })
}

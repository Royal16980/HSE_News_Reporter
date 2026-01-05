import { openDB } from 'idb'

export type ArticleActionType = 'approve' | 'reject' | 'schedule' | 'snooze'

export type ArticleAction = {
  id?: number
  articleId: string
  type: ArticleActionType
  payload?: Record<string, unknown>
  timestamp?: number
}

const DB_NAME = 'hse-admin-queue'
const STORE_NAME = 'actions'

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

export async function queueAction(action: ArticleAction) {
  const db = await getDb()
  await db.add(STORE_NAME, { ...action, timestamp: Date.now() })
}

export async function getQueuedActions() {
  const db = await getDb()
  return db.getAll(STORE_NAME)
}

export async function clearQueuedAction(id: number) {
  const db = await getDb()
  await db.delete(STORE_NAME, id)
}

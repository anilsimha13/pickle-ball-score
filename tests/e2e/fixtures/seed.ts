import { type Page } from '@playwright/test'

// Sample data inlined to avoid path-alias resolution issues in Playwright's TS compile
const SAMPLE_PLAYERS = [
  { id: 'player-001', name: 'Arjun Sharma', age: 28, place: 'Hyderabad', level: 'Advanced', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'player-002', name: 'Priya Nair', age: 25, place: 'Bangalore', level: 'Intermediate', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'player-003', name: 'Rohan Mehta', age: 32, place: 'Mumbai', level: 'Pro', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'player-004', name: 'Sneha Reddy', age: 22, place: 'Hyderabad', level: 'Beginner', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'player-005', name: 'Kiran Patel', age: 30, place: 'Ahmedabad', level: 'Intermediate', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'player-006', name: 'Divya Iyer', age: 27, place: 'Chennai', level: 'Advanced', createdAt: '2026-01-01T00:00:00.000Z' },
] as const

const SAMPLE_TEAMS = [
  { id: 'team-001', name: 'Smash Bros', playerIds: ['player-001', 'player-002'], createdAt: '2026-01-02T00:00:00.000Z' },
  { id: 'team-002', name: 'Net Ninjas', playerIds: ['player-003', 'player-004'], createdAt: '2026-01-02T00:00:00.000Z' },
  { id: 'team-003', name: 'Dink Masters', playerIds: ['player-005', 'player-006'], createdAt: '2026-01-02T00:00:00.000Z' },
  { id: 'team-004', name: 'Kitchen Kings', playerIds: ['player-001', 'player-003'], createdAt: '2026-01-02T00:00:00.000Z' },
] as const

// DB constants must match src/lib/storage.ts
const DB_NAME = 'pickle-ball-score'
const OBJECT_STORE = 'zustand'
const PLAYER_KEY = 'pbs-players'
const TEAM_KEY = 'pbs-teams'

export { SAMPLE_PLAYERS, SAMPLE_TEAMS }

/**
 * Writes sample data into the app's IndexedDB and reloads so Zustand hydrates.
 * Call after navigating to any app page (so the DB has been initialised).
 */
export async function seedDatabase(page: Page) {
  // Ensure the DB exists by waiting for the page to be idle
  await page.waitForLoadState('networkidle')

  await page.evaluate(
    ({ dbName, storeName, playerKey, teamKey, players, teams }) => {
      return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(dbName)
        request.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName)
          }
        }
        request.onsuccess = (e) => {
          const db = (e.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains(storeName)) {
            db.close()
            // Upgrade needed — bump version
            const r2 = indexedDB.open(dbName, db.version + 1)
            r2.onupgradeneeded = (ev) => {
              const db2 = (ev.target as IDBOpenDBRequest).result
              if (!db2.objectStoreNames.contains(storeName)) {
                db2.createObjectStore(storeName)
              }
            }
            r2.onsuccess = (ev) => {
              const db2 = (ev.target as IDBOpenDBRequest).result
              writeData(db2)
            }
            r2.onerror = () => reject(r2.error)
            return
          }
          writeData(db)

          function writeData(db: IDBDatabase) {
            const tx = db.transaction([storeName], 'readwrite')
            const store = tx.objectStore(storeName)
            store.put(JSON.stringify({ state: { players }, version: 0 }), playerKey)
            store.put(JSON.stringify({ state: { teams }, version: 0 }), teamKey)
            tx.oncomplete = () => { db.close(); resolve() }
            tx.onerror = () => reject(tx.error)
          }
        }
        request.onerror = () => reject(request.error)
      })
    },
    {
      dbName: DB_NAME,
      storeName: OBJECT_STORE,
      playerKey: PLAYER_KEY,
      teamKey: TEAM_KEY,
      players: SAMPLE_PLAYERS,
      teams: SAMPLE_TEAMS,
    },
  )

  await page.reload()
  await page.waitForLoadState('networkidle')
}

/**
 * Clears the IndexedDB so each test starts from a blank slate.
 */
export async function clearDatabase(page: Page) {
  await page.evaluate((dbName) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      request.onblocked = () => resolve() // may be blocked; resolve anyway
    })
  }, DB_NAME)
}

/**
 * IndexedDB-based auto-save for the current Clapper project.
 *
 * Stores the serialized .clap blob silently in IndexedDB so the user
 * doesn't lose work if the browser crashes or the page reloads.
 *
 * Auto-saves are keyed by a fixed constant so only the most recent one
 * is ever kept (no unbounded growth).
 */

const DB_NAME = 'clapper_autosave'
const DB_VERSION = 1
const STORE_NAME = 'projects'
const AUTO_SAVE_KEY = 'autosave'

export interface AutoSaveRecord {
  blob: Blob
  savedAt: number // Date.now() ms
  title: string
  segmentCount: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Persist a serialized .clap blob to IndexedDB. Overwrites any previous auto-save. */
export async function saveAutoSaveBlob(
  blob: Blob,
  title: string,
  segmentCount: number
): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const record: AutoSaveRecord = { blob, savedAt: Date.now(), title, segmentCount }
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(record, AUTO_SAVE_KEY)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

/** Retrieve the most recent auto-save record, or null if none exists. */
export async function loadAutoSaveRecord(): Promise<AutoSaveRecord | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(AUTO_SAVE_KEY)
    req.onsuccess = () => {
      db.close()
      resolve((req.result as AutoSaveRecord) ?? null)
    }
    req.onerror = () => {
      db.close()
      reject(req.error)
    }
  })
}

/** Remove the auto-save (e.g. after a successful manual save or project close). */
export async function clearAutoSave(): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(AUTO_SAVE_KEY)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

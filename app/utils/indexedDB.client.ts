import { EntityTable, Dexie } from "dexie";

export interface LocalAvatar {
  avatarId: string;
  lastModified: number;
  model: Blob;
  sourceUrl: string;
}

const isClient = typeof window !== "undefined";

let db: Dexie & {
  avatars: EntityTable<LocalAvatar, "avatarId">;
};

if (isClient) {
  db = new Dexie("openchat") as typeof db;

  db.version(1).stores({
    avatars: "&avatarId,model",
  });
}

export const getIndexedDb = () => {
  if (!db) {
    throw new Error("IndexedDB can only be executed on the client");
  }
  return db;
};

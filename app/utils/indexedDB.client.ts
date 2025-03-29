import { EntityTable, Dexie } from "dexie";

export interface LocalAvatar {
  avatarId: string;
  lastModified: number;
  model: Blob;
  sourceUrl: string;
  userId: string;
}

const isClient = typeof window !== "undefined";

let db: Dexie & {
  avatars: EntityTable<LocalAvatar, "avatarId">;
};

if (isClient) {
  db = new Dexie("openchat") as typeof db;

  db.version(1).stores({
    avatars: "&avatarId,userId",
  });
}

export const getIndexedDb = () => {
  if (!db) {
    throw new Error("IndexedDB can only be executed on the client");
  }
  return db;
};

async function getModel(url: string) {
  const response = await fetch(url, { redirect: "follow" });
  return await response.blob();
}

export async function storeAvatarLocally({
  sourceUrl,
  avatarId,
  userId,
}: {
  sourceUrl: string;
  avatarId: string;
  userId: string;
}) {
  const blob = await getModel(sourceUrl);
  await getIndexedDb().avatars.put({
    avatarId,
    model: blob,
    lastModified: new Date().getMilliseconds(),
    sourceUrl,
    userId,
  });
}

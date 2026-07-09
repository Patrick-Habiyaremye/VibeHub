import Dexie from "dexie";

export const db = new Dexie("UploadDB");

db.version(1).stores({
  uploads: "id,status,createdAt"
});
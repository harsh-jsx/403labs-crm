import { readFile } from "node:fs/promises";
import admin from "firebase-admin";

/** Collections populated by `npm run seed` — not touching `users` (admins). */
const COLLECTIONS = ["leads", "activities", "meetings", "contacts", "tasks"];

async function loadServiceAccount() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const raw = await readFile(
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      "utf8",
    );
    return JSON.parse(raw);
  }
  const raw = await readFile(
    new URL("../serviceAccountKey.json", import.meta.url),
    "utf8",
  );
  return JSON.parse(raw);
}

async function deleteCollectionInBatches(db, name, batchSize = 450) {
  const ref = db.collection(name);
  let deleted = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const snap = await ref.limit(batchSize).get();
    if (snap.empty) break;
    const batch = db.batch();
    for (const doc of snap.docs) {
      batch.delete(doc.ref);
    }
    await batch.commit();
    deleted += snap.size;
  }
  return deleted;
}

async function main() {
  const serviceAccount = await loadServiceAccount();

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  const db = admin.firestore();
  const summary = [];

  for (const name of COLLECTIONS) {
    const n = await deleteCollectionInBatches(db, name);
    summary.push(`${name}: ${n}`);
  }

  // eslint-disable-next-line no-console
  console.log("Cleared Firestore collections (documents deleted):\n", summary.join("\n"));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

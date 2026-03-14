import { db } from "@/db";
import { global } from "@/db/schema";

export async function getGlobalMetadata() {
  try {
    return await db.select().from(global).limit(1);
  } catch {
    return [];
  }
}

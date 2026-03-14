import { db } from "@/db";
import { profile } from "@/db/schema";

export async function getProfile() {
  try {
    return await db.select().from(profile).limit(1);
  } catch {
    return [];
  }
}

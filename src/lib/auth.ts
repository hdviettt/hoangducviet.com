import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Simple auth for single-user blog.
 * Uses env vars ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET.
 * No crypto, no database — just compare values.
 */

export async function validateCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}

export async function setSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, process.env.SESSION_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token === process.env.SESSION_SECRET;
}

export function verifySessionCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  return cookieValue === process.env.SESSION_SECRET;
}

export async function requireAuth(): Promise<void> {
  const valid = await getSession();
  if (!valid) {
    throw new Error("Unauthorized");
  }
}

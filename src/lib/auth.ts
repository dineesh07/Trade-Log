import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const COOKIE_NAME = "tradelog_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "tradelog-super-secure-secret-key-change-in-production-32chars"
);

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
}

/**
 * Creates a signed JWT for the user session
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

/**
 * Verifies a JWT session token and returns the decoded user payload
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (!payload.id || !payload.email) return null;
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: (payload.name as string) || null,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves the current authenticated user session from cookies
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

/**
 * Sets the session cookie
 */
export async function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

/**
 * Clears the session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Authenticates user credentials against the database
 */
export async function authenticateCredentials(
  email: string,
  plainPassword: string
): Promise<{ user?: SessionUser; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return { error: "Invalid email or password" };
    }

    const isValid = await bcrypt.compare(plainPassword, user.passwordHash);
    if (!isValid) {
      return { error: "Invalid email or password" };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (err: any) {
    console.error("Authentication error:", err);
    return { error: "An unexpected error occurred during login. Please check database connection." };
  }
}

import { NextResponse } from "next/server";
import { authenticateCredentials, createSessionToken, setSessionCookie, COOKIE_NAME } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const authResult = await authenticateCredentials(email, password);

    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(authResult.user);
    await setSessionCookie(token);

    const response = NextResponse.json({
      success: true,
      user: authResult.user,
    });

    // Explicitly set cookie on the returned NextResponse headers for full serverless/Vercel compatibility
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

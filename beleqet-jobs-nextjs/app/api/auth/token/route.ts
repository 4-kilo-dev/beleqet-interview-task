import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Safely exposes the current user's access token to client-side code
 * so that socket.io-client can authenticate with the NestJS ChatGateway.
 *
 * This endpoint is protected by the fact that it only returns the token
 * that is stored in an HttpOnly cookie (the client JS cannot read that cookie directly).
 */
export async function GET() {
  const token = cookies().get("accessToken")?.value;
  if (!token) {
    return NextResponse.json({ token: null }, { status: 401 });
  }
  return NextResponse.json({ token });
}

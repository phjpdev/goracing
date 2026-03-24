import { NextResponse } from "next/server";

export async function GET() {
  const jwtKey = process.env.JWT_SECRET_KEY;
  const backendUrl = process.env.BACKEND_URL;

  return NextResponse.json({
    jwt_key_set: !!jwtKey,
    jwt_key_length: jwtKey?.length ?? 0,
    jwt_key_prefix: jwtKey?.slice(0, 6) ?? "EMPTY",
    backend_url: backendUrl ?? "NOT_SET",
    node_env: process.env.NODE_ENV ?? "NOT_SET",
  });
}

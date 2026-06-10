import { NextResponse } from "next/server";
import { adminCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  response.cookies.delete(adminCookieName());
  return response;
}

import { NextResponse } from "next/server";
import { clientCookieName } from "@/lib/clientAuth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/client/login", request.url), { status: 303 });
  response.cookies.delete(clientCookieName());
  return response;
}

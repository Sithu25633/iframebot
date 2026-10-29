import { NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId") || "dev_" + Math.random().toString(36).substring(2, 10);
  const phone = searchParams.get("phone") || "";
  const returnTo = searchParams.get("returnTo") || "/";

  // Use host header or request URL to construct redirect_uri
  const host = request.headers.get("host") || "web-umber-six-e1un7z6257.vercel.app";
  const protocol = host.includes("localhost") ? "http" : "https";
  const redirectUri = host.includes("localhost")
    ? `http://${host}/api/auth/callback/google`
    : `https://web-umber-six-e1un7z6257.vercel.app/api/auth/callback/google`;

  const statePayload = Buffer.from(
    JSON.stringify({ deviceId, phone, returnTo, redirectUri })
  ).toString("base64");

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", statePayload);

  return NextResponse.redirect(googleAuthUrl.toString());
}

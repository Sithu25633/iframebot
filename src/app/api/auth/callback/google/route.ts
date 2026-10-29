import { NextResponse } from "next/server";
import { upsertUser } from "@/lib/db";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    const errorMsg = error || "Authorization code not provided";
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Sign-in Error</title></head>
        <body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="background:#111;padding:30px;border-radius:16px;border:1px solid #333;text-align:center;max-width:400px;">
            <h2 style="color:#ef4444;margin-top:0;">Google Login Failed</h2>
            <p style="color:#aaa;font-size:14px;">${errorMsg}</p>
            <a href="/" style="display:inline-block;margin-top:15px;background:#fff;color:#000;padding:10px 20px;border-radius:10px;text-decoration:none;font-weight:bold;">Return Home</a>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  let deviceId = "dev_default";
  let phone = "";
  let returnTo = "/?welcome_tutorial=true";
  let redirectUri = "https://web-umber-six-e1un7z6257.vercel.app/api/auth/callback/google";

  if (stateParam) {
    try {
      const decoded = JSON.parse(Buffer.from(stateParam, "base64").toString("utf-8"));
      if (decoded.deviceId) deviceId = decoded.deviceId;
      if (decoded.phone) phone = decoded.phone;
      if (decoded.returnTo) returnTo = decoded.returnTo;
      if (decoded.redirectUri) redirectUri = decoded.redirectUri;
    } catch (e) {}
  }

  // Ensure redirect URL has tutorial param if returning to home
  if (returnTo === "/" || returnTo === "") {
    returnTo = "/?welcome_tutorial=true";
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange token with Google");
    }

    // 2. Fetch user profile from Google UserInfo endpoint
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userRes.json();
    if (!userRes.ok || !googleUser.email) {
      throw new Error("Failed to retrieve Google profile");
    }

    // 3. Upsert user in database with Device Lock
    const upsertRes = await upsertUser({
      name: googleUser.name || googleUser.email.split("@")[0],
      email: googleUser.email.toLowerCase(),
      image: googleUser.picture || "",
      phone: phone || "",
      deviceId,
    });

    if (upsertRes.error) {
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head><title>Account Limit</title></head>
          <body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <div style="background:#111;padding:30px;border-radius:16px;border:1px solid #ef4444;text-align:center;max-width:420px;">
              <h2 style="color:#ef4444;margin-top:0;">Single Device Lock</h2>
              <p style="color:#ccc;font-size:14px;line-height:1.5;">${upsertRes.error}</p>
              <a href="/" style="display:inline-block;margin-top:15px;background:#fff;color:#000;padding:10px 20px;border-radius:10px;text-decoration:none;font-weight:bold;">Return Home</a>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    const authenticatedUser = upsertRes.user;

    // 4. Return HTML script to sync localStorage and cookies permanently
    const userJson = JSON.stringify(authenticatedUser);
    const html = `<!DOCTYPE html>
      <html>
        <head>
          <title>Google Sign-In Success</title>
        </head>
        <body style="background:#000;color:#fff;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="background:#111;padding:30px;border-radius:20px;border:1px solid #333;text-align:center;max-width:400px;">
            <h2 style="color:#fff;margin:0 0 10px 0;">Google Sign-In Complete ✅</h2>
            <p style="color:#aaa;font-size:14px;">Welcome, <b>${authenticatedUser.name}</b>!</p>
            <p style="color:#666;font-size:12px;">Loading FilmFeed 4K...</p>
          </div>
          <script>
            try {
              localStorage.setItem("filmfeed_current_user", ${JSON.stringify(userJson)});
              localStorage.setItem("filmfeed_user", ${JSON.stringify(userJson)});
              sessionStorage.setItem("filmfeed_welcome_seen", "true");
              document.cookie = "filmfeed_user_id=" + ${JSON.stringify(authenticatedUser.id)} + "; path=/; max-age=31536000; SameSite=Lax";
              document.cookie = "filmfeed_device_id=" + ${JSON.stringify(deviceId)} + "; path=/; max-age=31536000; SameSite=Lax";
              window.dispatchEvent(new Event("storage"));
            } catch(e) {}
            setTimeout(() => {
              window.location.href = ${JSON.stringify(returnTo)};
            }, 300);
          </script>
        </body>
      </html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err: any) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Authentication Error</title></head>
        <body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="background:#111;padding:30px;border-radius:16px;border:1px solid #333;text-align:center;max-width:400px;">
            <h2 style="color:#ef4444;margin-top:0;">Sign-in Error</h2>
            <p style="color:#aaa;font-size:14px;">${err.message || "An unexpected error occurred during Google Sign-In"}</p>
            <a href="/" style="display:inline-block;margin-top:15px;background:#fff;color:#000;padding:10px 20px;border-radius:10px;text-decoration:none;font-weight:bold;">Return Home</a>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

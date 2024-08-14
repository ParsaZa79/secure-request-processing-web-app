import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import jwt from "jsonwebtoken";

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
);

export async function POST(request: NextRequest) {
  try {
    console.log("CCCCOOOOOOODDDDDDEEEEE", request);
    const { code } = await request.json();

    console.log("CCCCOOOOOOODDDDDDEEEEE", code);

    return;

    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    // Here you would typically:
    // 1. Check if the user exists in your database
    // 2. If not, create a new user
    // 3. Create or update a session for the user

    const sessionToken = jwt.sign(
      {
        email: data.email,
        name: data.name,
        picture: data.picture,
      },
      "28bc735fcd38c632c248c27eae930813e2b9cf7e1580d9eedd2de44fb6e57eb2",
      { expiresIn: "1d" },
    );

    return NextResponse.json({ sessionToken });
  } catch (error) {
    console.error("Error exchanging code for tokens", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Google OAuth endpoint" });
}

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // Step 1: Exchange code for token
    const tokenRes = await axios.post(
      "https://auth.atlassian.com/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: process.env.NEXT_PUBLIC_JIRA_CLIENT_ID!,
        client_secret: process.env.JIRA_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.NEXT_PUBLIC_JIRA_REDIRECT_URI!,
      }
    );

    // Step 2: Get accessible resources (cloud ID)
    const resourcesRes = await axios.get(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
      }
    );

    console.log(
      "[exchange-jira] Successfully exchanged code for token and retrieved resources"
    );

    return NextResponse.json({
      access_token: tokenRes.data.access_token,
      expires_in: tokenRes.data.expires_in,
      instances: resourcesRes.data.map((r: any) => ({
        id: r.id,
        name: r.name,
        url: r.url,
      })),
    });
  } catch (error) {
    console.error("Error exchanging Jira code:", error);
    return NextResponse.json(
      { error: "Failed to exchange code" },
      { status: 500 }
    );
  }
}

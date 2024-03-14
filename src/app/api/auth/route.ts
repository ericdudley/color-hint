import { generateUUID } from "@/utils/uuid";
import * as Ably from "ably";
import { NextResponse } from "next/server";

/**
 * Helper endpoint to allow the web client to anonymously create a new Ably channel.
 */
export async function POST(request: Request) {
  return new Promise<Response>((resolve, reject) => {
    if (!process.env.ABLY_API_KEY) {
      reject(new Error("Missing environment variable: ABLY_API_KEY"));
      return;
    }

    const client = new Ably.Realtime(process.env.ABLY_API_KEY);
    client.auth.createTokenRequest(
      { clientId: "color-hint" },
      null,
      (err, tokenRequest) => {
        if (err) {
          console.error("Error requesting token:", err);
          return;
        }

        resolve(NextResponse.json(tokenRequest));
      },
    );
  });
}

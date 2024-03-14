import { Realtime } from "ably";

export function getAblyClient() {
  return new Realtime({
    authUrl: "/api/auth",
  });
}

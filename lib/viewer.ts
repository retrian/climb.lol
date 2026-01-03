import { headers } from "next/headers";

export function getViewerId(): string | null {
  const headerList = headers();
  return headerList.get("x-user-id") ?? "user-1";
}

import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/application/get-current-user";

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

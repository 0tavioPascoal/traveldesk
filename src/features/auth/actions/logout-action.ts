"use server";

import { redirect } from "next/navigation";

import { signOutUser } from "@/features/auth/application/sign-out-user";

export async function logoutAction(): Promise<void> {
  await signOutUser();
  redirect("/login");
}

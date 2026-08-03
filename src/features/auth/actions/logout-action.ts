"use server";

import { redirect, RedirectType } from "next/navigation";

import { signOutUser } from "@/features/auth/application/sign-out-user";

export type LogoutActionState = {
  error: string | null;
};

export async function logoutAction(
  previousState: LogoutActionState,
  formData: FormData,
): Promise<LogoutActionState> {
  void previousState;
  void formData;

  try {
    await signOutUser();
  } catch {
    return {
      error: "Não foi possível encerrar sua sessão. Tente novamente.",
    };
  }

  redirect("/login", RedirectType.replace);
}

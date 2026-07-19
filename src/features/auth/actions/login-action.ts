"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { authenticateUser } from "@/features/auth/application/authenticate-user";
import { loginSchema } from "@/features/auth/schemas/login-schema";
import type { LoginActionState } from "@/features/auth/types/auth";

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const validationResult = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validationResult.success) {
    const fieldErrors = z.flattenError(validationResult.error).fieldErrors;

    return {
      status: "error",
      fieldErrors: {
        email: fieldErrors.email,
        password: fieldErrors.password,
      },
      message: null,
    };
  }

  const result = await authenticateUser(validationResult.data);

  if (!result.success) {
    return {
      status: "error",
      fieldErrors: {},
      message:
        result.reason === "invalid_credentials"
          ? "E-mail ou senha inválidos."
          : "Não foi possível entrar agora. Tente novamente.",
    };
  }

  redirect("/app");
}

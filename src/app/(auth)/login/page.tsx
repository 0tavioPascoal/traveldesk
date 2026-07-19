import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/application/get-current-user";
import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/app");
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-zinc-100 px-4 py-10 sm:px-6">
      <section
        aria-labelledby="login-title"
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="mb-8 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            TravelDesk
          </p>
          <h1
            id="login-title"
            className="text-2xl font-semibold tracking-tight text-zinc-950"
          >
            Acesse sua conta
          </h1>
          <p className="text-sm leading-6 text-zinc-600">
            Entre com o e-mail e a senha fornecidos pela sua organização.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}

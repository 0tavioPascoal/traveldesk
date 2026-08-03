import {
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  Route,
  ShieldCheck,
} from "lucide-react";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { getCurrentUser } from "@/features/auth/application/get-current-user";
import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/app");
  }

  const highlights = [
    {
      icon: Route,
      title: "Planejamento centralizado",
      description: "Viagens, equipes e recursos no mesmo fluxo operacional.",
    },
    {
      icon: CalendarCheck2,
      title: "Operação coordenada",
      description: "Disponibilidades e execução acompanhadas com clareza.",
    },
    {
      icon: ShieldCheck,
      title: "Acesso por organização",
      description: "Ambiente protegido conforme seu vínculo e papel.",
    },
  ] as const;

  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="absolute -left-24 top-1/4 size-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 bottom-0 size-80 rounded-full bg-accent/70 blur-3xl"
      />
      <ThemeToggle className="absolute right-4 top-4 z-20 bg-card/90 shadow-sm backdrop-blur sm:right-6 sm:top-6" />

      <div className="relative mx-auto grid min-h-svh w-full max-w-[1440px] lg:grid-cols-[1.05fr_0.95fr]">
        <section
          aria-labelledby="login-brand-title"
          className="hidden border-r border-border bg-card/55 px-10 py-12 lg:flex lg:flex-col lg:justify-between xl:px-16"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <BriefcaseBusiness aria-hidden="true" className="size-6" />
            </div>
            <div>
              <p className="font-bold tracking-tight">TravelDesk</p>
              <p className="text-xs text-muted-foreground">
                Operações técnicas
              </p>
            </div>
          </div>

          <div className="my-14 max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Gestão de viagens técnicas
            </p>
            <h2
              id="login-brand-title"
              className="mt-4 text-4xl font-bold leading-tight tracking-tight xl:text-5xl"
            >
              Sua operação preparada para cada destino.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Organize o planejamento, a disponibilidade dos recursos e a
              execução das viagens com uma visão única da operação.
            </p>

            <ul className="mt-10 grid gap-5">
              {highlights.map((highlight) => {
                const Icon = highlight.icon;
                return (
                  <li key={highlight.title} className="flex gap-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon aria-hidden="true" className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{highlight.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {highlight.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            Acesso restrito a usuários autorizados pela organização.
          </p>
        </section>

        <section
          aria-labelledby="login-title"
          className="flex min-h-svh items-center justify-center px-4 py-20 sm:px-8 lg:px-12"
        >
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <BriefcaseBusiness aria-hidden="true" className="size-5" />
              </div>
              <div>
                <p className="font-bold tracking-tight">TravelDesk</p>
                <p className="text-xs text-muted-foreground">
                  Operações técnicas
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card/95 p-6 text-card-foreground shadow-xl shadow-foreground/5 backdrop-blur sm:p-8">
              <div className="mb-8">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-3.5 text-success"
                  />
                  Acesso seguro
                </div>
                <h1
                  id="login-title"
                  className="text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl"
                >
                  Bem-vindo de volta
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Entre com as credenciais fornecidas pela sua organização.
                </p>
              </div>

              <LoginForm />

              <div className="mt-7 border-t border-border pt-5">
                <p className="text-center text-xs leading-5 text-muted-foreground">
                  Em caso de dificuldade de acesso, procure o administrador da
                  sua organização.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

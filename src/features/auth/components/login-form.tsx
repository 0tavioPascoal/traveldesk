"use client";

import { ArrowRight, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { InlineAlert } from "@/components/ui/inline-alert";
import { loginAction } from "@/features/auth/actions/login-action";
import type { LoginActionState } from "@/features/auth/types/auth";

const initialState: LoginActionState = {
  status: "idle",
  fieldErrors: {},
  message: null,
  email: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          Entrando...
        </>
      ) : (
        <>
          Entrar
          <ArrowRight aria-hidden="true" className="size-4" />
        </>
      )}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  const emailError = state.fieldErrors.email?.[0];
  const passwordError = state.fieldErrors.password?.[0];

  return (
    <form
      action={formAction}
      noValidate
      aria-label="Acesso ao TravelDesk"
      className="space-y-5"
    >
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-card-foreground">
          E-mail
        </label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            required
            defaultValue={state.email}
            disabled={pending}
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? "email-error" : undefined}
            className="h-11 w-full rounded-lg border border-input bg-background px-10 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted sm:text-sm"
            placeholder="voce@empresa.com"
          />
        </div>
        {emailError ? (
          <p id="email-error" role="alert" className="text-sm text-destructive">
            {emailError}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-card-foreground"
        >
          Senha
        </label>
        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
            aria-invalid={passwordError ? true : undefined}
            aria-describedby={passwordError ? "password-error" : undefined}
            className="h-11 w-full rounded-lg border border-input bg-background px-10 text-base text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted sm:text-sm"
          />
        </div>
        {passwordError ? (
          <p id="password-error" role="alert" className="text-sm text-destructive">
            {passwordError}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <InlineAlert tone="error">{state.message}</InlineAlert>
      ) : null}

      <SubmitButton />
    </form>
  );
}

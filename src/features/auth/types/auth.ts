export type AuthenticatedUser = Readonly<{
  id: string;
  email: string;
}>;

export type LoginFieldErrors = {
  email?: string[];
  password?: string[];
};

export type LoginActionState = {
  status: "idle" | "error";
  fieldErrors: LoginFieldErrors;
  message: string | null;
};

export type AuthenticateUserResult =
  | { success: true }
  | {
      success: false;
      reason: "invalid_credentials" | "authentication_unavailable";
    };

import type { Tables } from "@/lib/supabase/database.types";

export type ServiceType = Pick<
  Tables<"service_types">,
  "id" | "name" | "description" | "active" | "updated_at"
>;

export type ActiveServiceType = Pick<
  Tables<"service_types">,
  "id" | "name"
>;

export type ServiceTypeStatusFilter = "all" | "active" | "inactive";

export type ServiceTypeFilters = {
  query: string;
  status: ServiceTypeStatusFilter;
};

export type ServiceTypeFormValues = {
  name: string;
  description: string;
  active: boolean;
};

export type ServiceTypeFieldErrors = {
  name?: string[];
  description?: string[];
  active?: string[];
};

export type ServiceTypeActionState = {
  status: "idle" | "error" | "success";
  fieldErrors: ServiceTypeFieldErrors;
  message: string | null;
  values: ServiceTypeFormValues;
};

export type ServiceTypeStatusActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

export type ServiceTypeMutationResult =
  | { success: true }
  | {
      success: false;
      reason: "duplicate_name" | "not_found" | "unexpected";
    };

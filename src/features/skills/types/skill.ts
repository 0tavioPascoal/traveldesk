import type { Tables } from "@/lib/supabase/database.types";

export type Skill = Pick<
  Tables<"skills">,
  "id" | "name" | "description" | "active" | "updated_at"
>;

export type ActiveSkill = Pick<Tables<"skills">, "id" | "name">;

export type SkillStatusFilter = "all" | "active" | "inactive";

export type SkillFilters = {
  query: string;
  status: SkillStatusFilter;
};

export type SkillFormValues = {
  name: string;
  description: string;
  active: boolean;
};

export type SkillFieldErrors = {
  name?: string[];
  description?: string[];
  active?: string[];
};

export type SkillActionState = {
  status: "idle" | "error" | "success";
  fieldErrors: SkillFieldErrors;
  message: string | null;
  values: SkillFormValues;
};

export type SkillStatusActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

export type SkillMutationResult =
  | { success: true }
  | {
      success: false;
      reason: "duplicate_name" | "not_found" | "unexpected";
    };

import type { Tables } from "@/lib/supabase/database.types";

export type ClientDetails = Pick<
  Tables<"clients">,
  | "id"
  | "legal_name"
  | "trade_name"
  | "tax_id"
  | "segment"
  | "notes"
  | "active"
  | "updated_at"
>;

export type ClientListItem = Pick<
  ClientDetails,
  | "id"
  | "legal_name"
  | "trade_name"
  | "tax_id"
  | "active"
  | "updated_at"
> & {
  unitCount: number;
};

export type ClientUnit = Pick<
  Tables<"client_units">,
  | "id"
  | "client_id"
  | "name"
  | "tax_id"
  | "address_line"
  | "address_number"
  | "address_complement"
  | "district"
  | "city"
  | "state"
  | "postal_code"
  | "contact_name"
  | "contact_email"
  | "contact_phone"
  | "access_instructions"
  | "notes"
  | "active"
  | "updated_at"
>;

export type ActiveClient = Pick<
  Tables<"clients">,
  "id" | "legal_name" | "trade_name"
>;

export type ActiveClientUnit = Pick<
  Tables<"client_units">,
  "id" | "name" | "city" | "state"
>;

export type ClientStatusFilter = "all" | "active" | "inactive";

export type ClientFilters = {
  query: string;
  status: ClientStatusFilter;
};

export type ClientUnitFilters = {
  query: string;
  status: ClientStatusFilter;
};

export type ClientFormValues = {
  legalName: string;
  tradeName: string;
  taxId: string;
  segment: string;
  notes: string;
};

export type ClientUnitFormValues = {
  name: string;
  taxId: string;
  addressLine: string;
  addressNumber: string;
  addressComplement: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  accessInstructions: string;
  notes: string;
};

export type ClientFieldErrors = Partial<
  Record<keyof ClientFormValues, string[]>
>;

export type ClientUnitFieldErrors = Partial<
  Record<keyof ClientUnitFormValues, string[]>
>;

export type ClientActionState = {
  status: "idle" | "error";
  fieldErrors: ClientFieldErrors;
  message: string | null;
  values: ClientFormValues;
};

export type ClientUnitActionState = {
  status: "idle" | "error";
  fieldErrors: ClientUnitFieldErrors;
  message: string | null;
  values: ClientUnitFormValues;
};

export type ClientStatusActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

export type ClientMutationResult =
  | { success: true; clientId: string }
  | {
      success: false;
      reason:
        | "duplicate_legal_name"
        | "duplicate_tax_id"
        | "active_units_exist"
        | "not_found"
        | "unexpected";
    };

export type ClientUnitMutationResult =
  | { success: true }
  | {
      success: false;
      reason:
        | "duplicate_name"
        | "duplicate_tax_id"
        | "client_inactive"
        | "client_not_found"
        | "not_found"
        | "unexpected";
    };

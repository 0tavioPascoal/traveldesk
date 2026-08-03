import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateSchedule(organizationSlug: string) {
  revalidatePath(`/app/${organizationSlug}/planejamento/escala`);
  revalidatePath(`/app/${organizationSlug}/dashboard`);
  revalidatePath(`/app/${organizationSlug}/analises`);
}

import { z } from "zod";

export const technicianProfileSchema = z.object({
  profileId: z.uuid("Selecione um usuário válido."),
});

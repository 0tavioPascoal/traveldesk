import type { TripStatus } from "@/features/trips/types/trip";

export const tripNextStepLabels: Record<TripStatus, string> = {
  draft: "Completar planejamento",
  planned: "Confirmar viagem",
  confirmed: "Iniciar deslocamento",
  traveling: "Registrar chegada",
  at_client: "Iniciar atendimento",
  in_service: "Iniciar retorno",
  returning: "Finalizar viagem",
  finished: "Concluída",
  canceled: "Cancelada",
};

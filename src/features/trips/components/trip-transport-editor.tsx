"use client";

import { useActionState, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { removeTripTransportAction } from "@/features/trips/actions/remove-trip-transport-action";
import { saveTripTransportAction } from "@/features/trips/actions/save-trip-transport-action";
import { VehicleAvailabilityBadge } from "@/features/trips/components/vehicle-availability-badge";
import type { TripTransportActionState, TripTransportSummary } from "@/features/trips/types/trip-transport";

const initialState = { status: "idle", message: null } satisfies TripTransportActionState;

const driverReason = {
  inactive: "Técnico inativo",
  not_authorized: "Não autorizado a dirigir",
  license_incomplete: "CNH incompleta",
  license_expired: "CNH vencida durante a viagem",
  unavailability: "Indisponível no período",
  trip_conflict: "Conflito com outra viagem",
} as const;

function date(value: string | null) {
  if (!value) return "Não informada";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

export function TripTransportEditor({ organizationSlug, tripId, summary, editable, timezone }: {
  organizationSlug: string;
  tripId: string;
  summary: TripTransportSummary;
  editable: boolean;
  timezone: string;
}) {
  const [vehicleId, setVehicleId] = useState(summary.assignment?.vehicleId ?? "");
  const [driverId, setDriverId] = useState(summary.assignment?.driverTechnicianId ?? "");
  const [query, setQuery] = useState("");
  const [saveState, saveAction, savePending] = useActionState(
    saveTripTransportAction.bind(null, organizationSlug, tripId), initialState,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeTripTransportAction.bind(null, organizationSlug, tripId), initialState,
  );
  const selectedVehicle = summary.vehicles.find((item) => item.id === vehicleId);
  const selectedDriver = summary.drivers.find((item) => item.technicianId === driverId);
  const search = query.trim().toLocaleLowerCase("pt-BR");
  const vehicles = summary.vehicles.filter((item) => !search
    || item.plate.toLocaleLowerCase("pt-BR").includes(search)
    || item.brand.toLocaleLowerCase("pt-BR").includes(search)
    || item.model.toLocaleLowerCase("pt-BR").includes(search));
  const pending = savePending || removePending;
  const invalidSelection = !selectedVehicle || selectedVehicle.group !== "available"
    || !selectedDriver || selectedDriver.group !== "eligible";

  return (
    <div className="space-y-5">
      {summary.assignment ? (
        <div className="rounded-xl border border-border bg-muted p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{summary.assignment.brand} {summary.assignment.model}</p>
              <p className="text-sm text-muted-foreground">{summary.assignment.plate} · {summary.assignment.vehicleBaseCity}/{summary.assignment.vehicleBaseState}</p>
            </div>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold">
              {summary.teamSize} de {summary.assignment.passengerCapacity} lugares
            </span>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-muted-foreground">Motorista</dt><dd className="font-medium">{summary.assignment.driverName}</dd></div>
            <div><dt className="text-muted-foreground">CNH</dt><dd className="font-medium">Categoria {summary.assignment.driverLicenseCategory ?? "Não informada"} · {date(summary.assignment.driverLicenseExpiresAt)}</dd></div>
            <div><dt className="text-muted-foreground">Período reservado</dt><dd className="font-medium">{summary.assignment.occupancyStartsAt ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: timezone }).format(new Date(summary.assignment.occupancyStartsAt)) : "Não definido"}</dd></div>
            <div><dt className="text-muted-foreground">Reserva de agenda</dt><dd className="font-medium">{summary.assignment.blocksSchedule ? "Ativa" : "Provisória"}</dd></div>
          </dl>
          {!summary.assignmentValid ? (
            <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              <p className="font-semibold">O transporte precisa de revisão:</p>
              <ul className="mt-1 list-disc pl-5">{summary.assignmentIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
            </div>
          ) : null}
        </div>
      ) : <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">Nenhum transporte definido para esta viagem.</p>}

      {summary.periodRequired ? (
        <InlineAlert tone="warning">Defina o período da viagem antes de reservar um veículo.</InlineAlert>
      ) : null}
      {!summary.teamSize ? (
        <InlineAlert tone="warning">Adicione técnicos à viagem antes de definir o motorista.</InlineAlert>
      ) : null}
      {summary.teamSize > 0 && !summary.drivers.some((driver) => driver.group === "eligible") ? (
        <InlineAlert tone="warning">Nenhum técnico alocado está apto a dirigir durante todo o período.</InlineAlert>
      ) : null}

      {editable && !summary.periodRequired && summary.teamSize > 0 ? (
        <form action={saveAction} className="space-y-5">
          <input type="hidden" name="vehicleId" value={vehicleId} />
          <input type="hidden" name="driverTechnicianId" value={driverId} />
          <fieldset disabled={pending} className="space-y-3">
            <legend className="text-sm font-semibold">Veículo</legend>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar placa, marca ou modelo" className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm" />
            {!vehicles.length ? <p className="text-sm text-muted-foreground">Nenhum veículo encontrado.</p> : null}
            <div className="grid gap-3 lg:grid-cols-2">
              {vehicles.map((vehicle) => (
                <label key={vehicle.id} className={`flex gap-3 rounded-lg border p-4 ${vehicleId === vehicle.id ? "border-primary ring-1 ring-primary" : "border-border"} ${vehicle.group === "unavailable" ? "bg-muted" : "cursor-pointer"}`}>
                  <input type="radio" checked={vehicleId === vehicle.id} disabled={vehicle.group === "unavailable"} onChange={() => setVehicleId(vehicle.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-start justify-between gap-2"><span className="font-semibold">{vehicle.brand} {vehicle.model}</span><VehicleAvailabilityBadge reason={vehicle.unavailableReason} /></span>
                    <span className="mt-1 block text-sm text-muted-foreground">{vehicle.plate} · {vehicle.passengerCapacity} pessoas · {vehicle.baseCity}/{vehicle.baseState}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset disabled={pending} className="space-y-3 border-t border-border pt-5">
            <legend className="text-sm font-semibold">Motorista</legend>
            <div className="grid gap-3 lg:grid-cols-2">
              {summary.drivers.map((driver) => (
                <label key={driver.technicianId} className={`flex gap-3 rounded-lg border p-4 ${driverId === driver.technicianId ? "border-primary ring-1 ring-primary" : "border-border"} ${driver.group === "ineligible" ? "bg-muted" : "cursor-pointer"}`}>
                  <input type="radio" checked={driverId === driver.technicianId} disabled={driver.group === "ineligible"} onChange={() => setDriverId(driver.technicianId)} />
                  <span>
                    <span className="font-semibold">{driver.name}{driver.isResponsible ? " · Responsável técnico" : ""}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">CNH {driver.driverLicenseCategory ?? "não informada"} · validade {date(driver.driverLicenseExpiresAt)}</span>
                    <span className={`mt-1 block text-xs font-medium ${driver.ineligibleReason ? "text-warning" : "text-success"}`}>{driver.ineligibleReason ? driverReason[driver.ineligibleReason] : "Apto para dirigir"}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block text-sm font-medium">Observações
            <textarea name="notes" maxLength={1000} defaultValue={summary.assignment?.notes ?? ""} disabled={pending} className="mt-1 min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm" />
            {saveState.fieldErrors?.notes?.map((error) => <span key={error} className="mt-1 block text-xs text-destructive">{error}</span>)}
          </label>
          <div className="flex flex-wrap justify-end gap-3">
            <button type="submit" disabled={pending || invalidSelection} className={buttonStyles({ size: "sm" })}>{savePending ? "Salvando..." : summary.assignment ? "Atualizar transporte" : "Reservar veículo"}</button>
          </div>
          {saveState.message ? <InlineAlert tone={saveState.status === "error" ? "error" : "success"}>{saveState.message}</InlineAlert> : null}
        </form>
      ) : null}

      {editable && summary.assignment ? (
        <form action={removeAction} onSubmit={(event) => { if (!window.confirm("Remover o veículo e o motorista desta viagem?")) event.preventDefault(); }} className="border-t border-border pt-4">
          <button type="submit" disabled={pending} className="text-sm font-semibold text-destructive disabled:opacity-50">{removePending ? "Removendo..." : "Remover reserva de transporte"}</button>
          {removeState.message ? <div className="mt-2"><InlineAlert tone={removeState.status === "error" ? "error" : "success"}>{removeState.message}</InlineAlert></div> : null}
        </form>
      ) : null}
    </div>
  );
}

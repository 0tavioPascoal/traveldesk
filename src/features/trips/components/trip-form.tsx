"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Clock3, MapPin, Route, Save, UsersRound } from "lucide-react";

import { SectionHeader } from "@/components/page/section-header";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { createTripAction } from "@/features/trips/actions/create-trip-action";
import { updateTripAction } from "@/features/trips/actions/update-trip-action";
import type { TripActionState, TripFormOptions, TripFormValues, TripStatus } from "@/features/trips/types/trip";

const states = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const sections = [
  { id: "informacoes-basicas", label: "Informações básicas" },
  { id: "cliente-atendimento", label: "Cliente e atendimento" },
  { id: "rota", label: "Rota" },
  { id: "periodos", label: "Períodos" },
  { id: "descricao-observacoes", label: "Descrição e observações" },
  { id: "revisao", label: "Revisão" },
];
const priorityLabels = { low: "Baixa", normal: "Normal", high: "Alta", urgent: "Urgente" } as const;
const inputBase = "h-11 w-full rounded-lg border bg-card px-3 text-base text-card-foreground outline-none transition-colors placeholder:text-subtle-foreground focus:border-ring focus:ring-2 focus:ring-ring/15 disabled:cursor-not-allowed disabled:bg-muted sm:text-sm";
const textareaBase = "w-full rounded-lg border bg-card px-3 py-2 text-sm text-card-foreground outline-none transition-colors placeholder:text-subtle-foreground focus:border-ring focus:ring-2 focus:ring-ring/15 disabled:cursor-not-allowed disabled:bg-muted";

function reviewDate(value: string) {
  if (!value) return "Não definido";
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}, ${time}`;
}

function RequiredIndicator() {
  return <span className="ml-1 text-destructive" aria-hidden="true">*</span>;
}

export function TripForm({ organizationSlug, timezone, options, initialValues, mode, tripId, currentStatus = "draft" }: {
  organizationSlug: string;
  timezone: string;
  options: TripFormOptions;
  initialValues: TripFormValues;
  mode: "create" | "edit";
  tripId?: string;
  currentStatus?: TripStatus;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = mode === "edit" && tripId
    ? updateTripAction.bind(null, organizationSlug, tripId)
    : createTripAction.bind(null, organizationSlug);
  const [state, formAction, pending] = useActionState(action, {
    status: "idle", message: null, fieldErrors: {}, values: initialValues,
  } satisfies TripActionState);
  const [values, setValues] = useState(initialValues);
  const units = useMemo(
    () => options.units.filter((unit) => unit.clientId === values.clientId),
    [options.units, values.clientId],
  );
  const cancelPath = mode === "edit" && tripId
    ? `/app/${organizationSlug}/planejamento/viagens/${tripId}`
    : `/app/${organizationSlug}/planejamento/viagens`;
  const canPlan = options.serviceTypes.some((item) => item.active);
  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initialValues), [initialValues, values]);
  const errorCount = Object.values(state.fieldErrors).reduce((total, errors) => total + (errors?.length ?? 0), 0);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty || pending) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty, pending]);

  useEffect(() => {
    if (!errorCount) return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
    firstInvalid?.focus();
    firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [errorCount, state]);

  function update<Name extends keyof TripFormValues>(name: Name, value: TripFormValues[Name]) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function fieldError(name: keyof TripFormValues) {
    return state.fieldErrors[name]?.[0];
  }

  function inputField(
    name: keyof TripFormValues,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    description?: string,
    required = false,
  ) {
    const error = fieldError(name);
    const descriptionId = description ? `${name}-description` : undefined;
    const errorId = error ? `${name}-error` : undefined;
    return (
      <div className="space-y-2">
        <label htmlFor={name} className="block text-sm font-medium text-foreground">{label}{required ? <RequiredIndicator /> : null}{required ? <span className="sr-only"> (obrigatório)</span> : null}</label>
        {description ? <p id={descriptionId} className="text-sm leading-5 text-muted-foreground">{description}</p> : null}
        <input
          id={name}
          name={name}
          disabled={pending}
          value={String(values[name] ?? "")}
          onChange={(event) => update(name, event.target.value as TripFormValues[typeof name])}
          aria-invalid={error ? true : undefined}
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
          className={`${inputBase} ${error ? "border-destructive" : "border-input"}`}
          {...props}
        />
        {error ? <p id={errorId} role="alert" className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  function stateSelect(name: "originState" | "destinationState") {
    const error = fieldError(name);
    const errorId = error ? `${name}-error` : undefined;
    return (
      <div className="space-y-2">
        <label htmlFor={name} className="block text-sm font-medium text-foreground">UF</label>
        <select id={name} name={name} disabled={pending} value={values[name]} onChange={(event) => update(name, event.target.value)} aria-invalid={error ? true : undefined} aria-describedby={errorId} className={`${inputBase} ${error ? "border-destructive" : "border-input"}`}>
          <option value="">Selecione</option>
          {states.map((item) => <option key={item}>{item}</option>)}
        </select>
        {error ? <p id={errorId} role="alert" className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  function confirmCancel(event: React.MouseEvent<HTMLAnchorElement>) {
    if (dirty && !window.confirm("Descartar as alterações não salvas?")) event.preventDefault();
  }

  const selectedClient = options.clients.find((item) => item.id === values.clientId);
  const selectedUnit = options.units.find((item) => item.id === values.clientUnitId);
  const selectedServiceType = options.serviceTypes.find((item) => item.id === values.serviceTypeId);

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-6">
      {state.message ? <InlineAlert tone="error" role="alert"><div><p className="font-semibold">Não foi possível salvar a viagem.</p><p className="mt-1">{state.message}</p>{errorCount ? <p className="mt-1 text-xs">{errorCount} {errorCount === 1 ? "campo precisa" : "campos precisam"} de revisão.</p> : null}</div></InlineAlert> : null}

      <div className="grid items-start gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label="Seções do formulário" className="hidden lg:sticky lg:top-24 lg:block">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle-foreground">Nesta página</p>
          <ol className="space-y-1 border-l border-border">
            {sections.map((section, index) => (
              <li key={section.id}><a href={`#${section.id}`} className="flex gap-2 border-l-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-foreground"><span aria-hidden="true">{index + 1}.</span>{section.label}</a></li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 space-y-6">
          <section id="informacoes-basicas" aria-labelledby="informacoes-basicas-title" className="scroll-mt-28 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <SectionHeader id="informacoes-basicas-title" title="Informações básicas" description="Identifique a finalidade da viagem e sua prioridade operacional." />
            <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,1fr)_14rem]">
              <div className="sm:col-span-2">{inputField("title", "Título", { required: true, minLength: 3, maxLength: 200, autoFocus: true, placeholder: "Ex.: Instalação e configuração do YMS" }, "Use um título curto que facilite a identificação da viagem.", true)}</div>
              <div className="space-y-2">
                <label htmlFor="priority" className="block text-sm font-medium text-foreground">Prioridade</label>
                <select id="priority" name="priority" disabled={pending} value={values.priority} onChange={(event) => update("priority", event.target.value as TripFormValues["priority"])} className={`${inputBase} border-input`}>
                  <option value="low">Baixa</option><option value="normal">Normal</option><option value="high">Alta</option><option value="urgent">Urgente</option>
                </select>
                <p className="text-xs leading-5 text-muted-foreground">Use “Urgente” somente quando houver necessidade de mobilização imediata.</p>
              </div>
              <div className="sm:col-start-1 sm:col-end-3">{inputField("reason", "Motivo da viagem", { maxLength: 500, placeholder: "Resuma a necessidade principal do atendimento." }, "Contextualize por que esta viagem está sendo solicitada.")}</div>
            </div>
          </section>

          <section id="cliente-atendimento" aria-labelledby="cliente-atendimento-title" className="scroll-mt-28 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <SectionHeader id="cliente-atendimento-title" title="Cliente e atendimento" description="Relacione a viagem ao cliente, à unidade de destino e ao tipo de atendimento." />
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="clientId" className="block text-sm font-medium text-foreground">Cliente<RequiredIndicator /><span className="sr-only"> (obrigatório)</span></label>
                <select id="clientId" name="clientId" required disabled={pending} value={values.clientId} onChange={(event) => {
                  setValues((current) => ({ ...current, clientId: event.target.value, clientUnitId: "", destinationCity: "", destinationState: "" }));
                }} aria-invalid={fieldError("clientId") ? true : undefined} aria-describedby={fieldError("clientId") ? "clientId-error" : undefined} className={`${inputBase} ${fieldError("clientId") ? "border-destructive" : "border-input"}`}>
                  <option value="">Selecione um cliente</option>
                  {options.clients.map((item) => <option key={item.id} value={item.id}>{item.tradeName ?? item.legalName}{item.active ? "" : " (inativo)"}</option>)}
                </select>
                {!options.clients.length ? <p className="text-sm text-warning">Nenhum cliente ativo está disponível.</p> : null}
                {fieldError("clientId") ? <p id="clientId-error" role="alert" className="text-sm text-destructive">{fieldError("clientId")}</p> : null}
              </div>
              <div className="space-y-2">
                <label htmlFor="clientUnitId" className="block text-sm font-medium text-foreground">Unidade<RequiredIndicator /><span className="sr-only"> (obrigatório)</span></label>
                <select id="clientUnitId" name="clientUnitId" required disabled={pending || !values.clientId} value={values.clientUnitId} onChange={(event) => {
                  const unit = units.find((item) => item.id === event.target.value);
                  setValues((current) => ({ ...current, clientUnitId: event.target.value, destinationCity: unit?.city ?? "", destinationState: unit?.state ?? "" }));
                }} aria-invalid={fieldError("clientUnitId") ? true : undefined} aria-describedby={`client-unit-help${fieldError("clientUnitId") ? " clientUnitId-error" : ""}`} className={`${inputBase} ${fieldError("clientUnitId") ? "border-destructive" : "border-input"}`}>
                  <option value="">{values.clientId && !units.length ? "Cliente sem unidades disponíveis" : "Selecione uma unidade"}</option>
                  {units.map((item) => <option key={item.id} value={item.id}>{item.name}{item.active ? "" : " (inativa)"}</option>)}
                </select>
                <p id="client-unit-help" className="text-sm text-muted-foreground">{values.clientId ? units.length ? "O destino será sugerido a partir da unidade selecionada." : "Este cliente não possui unidades disponíveis." : "Selecione primeiro o cliente para visualizar suas unidades."}</p>
                {fieldError("clientUnitId") ? <p id="clientUnitId-error" role="alert" className="text-sm text-destructive">{fieldError("clientUnitId")}</p> : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="serviceTypeId" className="block text-sm font-medium text-foreground">Tipo de atendimento</label>
                <select id="serviceTypeId" name="serviceTypeId" disabled={pending} value={values.serviceTypeId} onChange={(event) => update("serviceTypeId", event.target.value)} aria-invalid={fieldError("serviceTypeId") ? true : undefined} aria-describedby={`service-type-help${fieldError("serviceTypeId") ? " serviceTypeId-error" : ""}`} className={`${inputBase} ${fieldError("serviceTypeId") ? "border-destructive" : "border-input"}`}>
                  <option value="">Definir posteriormente</option>
                  {options.serviceTypes.map((item) => <option key={item.id} value={item.id}>{item.name}{item.active ? "" : " (inativo)"}</option>)}
                </select>
                <p id="service-type-help" className="text-sm text-muted-foreground">Pode permanecer vazio no rascunho, mas será exigido para planejar a viagem.</p>
                {!options.serviceTypes.length ? <p className="text-sm text-warning">Nenhum tipo de atendimento está disponível.</p> : null}
                {fieldError("serviceTypeId") ? <p id="serviceTypeId-error" role="alert" className="text-sm text-destructive">{fieldError("serviceTypeId")}</p> : null}
              </div>
            </div>
          </section>

          <section id="rota" aria-labelledby="rota-title" className="scroll-mt-28 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <SectionHeader id="rota-title" title="Rota" description="Informe o ponto de saída e revise o destino sugerido pela unidade." />
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <fieldset className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
                <legend className="mb-3 flex items-center gap-2 font-semibold text-foreground"><Route aria-hidden="true" className="size-4 text-muted-foreground" />Origem</legend>
                {inputField("originCity", "Cidade", { maxLength: 120, placeholder: "Cidade de saída" })}
                {stateSelect("originState")}
              </fieldset>
              <fieldset className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
                <legend className="mb-3 flex items-center gap-2 font-semibold text-foreground"><MapPin aria-hidden="true" className="size-4 text-muted-foreground" />Destino</legend>
                {inputField("destinationCity", "Cidade", { maxLength: 120, placeholder: "Cidade de destino" }, "Preenchida pela unidade e editável para preservar o planejamento.")}
                {stateSelect("destinationState")}
              </fieldset>
            </div>
          </section>

          <section id="periodos" aria-labelledby="periodos-title" className="scroll-mt-28 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <SectionHeader id="periodos-title" title="Períodos" description="Organize o deslocamento total e o intervalo previsto para o atendimento." />
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <fieldset className="grid gap-4 sm:grid-cols-2">
                <legend className="mb-3 flex items-center gap-2 font-semibold text-foreground"><Clock3 aria-hidden="true" className="size-4 text-muted-foreground" />Período da viagem</legend>
                {inputField("travelStartsAt", "Saída", { type: "datetime-local" })}
                {inputField("travelEndsAt", "Retorno previsto", { type: "datetime-local" })}
              </fieldset>
              <fieldset className="grid gap-4 sm:grid-cols-2">
                <legend className="mb-3 flex items-center gap-2 font-semibold text-foreground"><UsersRound aria-hidden="true" className="size-4 text-muted-foreground" />Período do atendimento</legend>
                {inputField("serviceStartsAt", "Início", { type: "datetime-local" })}
                {inputField("serviceEndsAt", "Fim", { type: "datetime-local" })}
              </fieldset>
            </div>
            <div className="mt-5 rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
              <p>O atendimento deve ocorrer dentro do período total da viagem.</p>
              <p className="mt-1 font-medium text-foreground">Horários considerados no fuso {timezone}.</p>
            </div>
          </section>

          <section id="descricao-observacoes" aria-labelledby="descricao-observacoes-title" className="scroll-mt-28 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <SectionHeader id="descricao-observacoes-title" title="Descrição e observações" description="Registre o contexto técnico e informações internas úteis para a coordenação." />
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-foreground">Descrição</label>
                <p id="description-help" className="text-sm text-muted-foreground">Inclua escopo, contexto e informações importantes para o planejamento.</p>
                <textarea id="description" name="description" rows={7} maxLength={5000} disabled={pending} value={values.description} onChange={(event) => update("description", event.target.value)} aria-invalid={fieldError("description") ? true : undefined} aria-describedby={`description-help description-count${fieldError("description") ? " description-error" : ""}`} className={`${textareaBase} ${fieldError("description") ? "border-destructive" : "border-input"}`} />
                <div className="flex justify-between gap-3"><span>{fieldError("description") ? <span id="description-error" role="alert" className="text-sm text-destructive">{fieldError("description")}</span> : null}</span><span id="description-count" className="text-xs text-subtle-foreground">{values.description.length}/5.000</span></div>
              </div>
              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-medium text-foreground">Observações internas</label>
                <p id="notes-help" className="text-sm text-muted-foreground">Registre informações adicionais destinadas à coordenação.</p>
                <textarea id="notes" name="notes" rows={7} maxLength={3000} disabled={pending} value={values.notes} onChange={(event) => update("notes", event.target.value)} aria-invalid={fieldError("notes") ? true : undefined} aria-describedby={`notes-help notes-count${fieldError("notes") ? " notes-error" : ""}`} className={`${textareaBase} ${fieldError("notes") ? "border-destructive" : "border-input"}`} />
                <div className="flex justify-between gap-3"><span>{fieldError("notes") ? <span id="notes-error" role="alert" className="text-sm text-destructive">{fieldError("notes")}</span> : null}</span><span id="notes-count" className="text-xs text-subtle-foreground">{values.notes.length}/3.000</span></div>
              </div>
            </div>
          </section>

          <section id="revisao" aria-labelledby="revisao-title" className="scroll-mt-28 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <SectionHeader id="revisao-title" title="Revisão" description="Confira os principais dados antes de salvar. A validação definitiva continua sendo realizada no servidor." />
            <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Viagem", values.title || "Título pendente"],
                ["Prioridade", priorityLabels[values.priority]],
                ["Cliente", selectedClient ? selectedClient.tradeName ?? selectedClient.legalName : "Cliente pendente"],
                ["Unidade", selectedUnit?.name ?? "Unidade pendente"],
                ["Atendimento", selectedServiceType?.name ?? "Tipo ainda não definido"],
                ["Rota", `${values.originCity || "Origem pendente"} → ${values.destinationCity || "Destino pendente"}`],
                ["Período da viagem", `${reviewDate(values.travelStartsAt)} → ${reviewDate(values.travelEndsAt)}`],
                ["Período do atendimento", `${reviewDate(values.serviceStartsAt)} → ${reviewDate(values.serviceEndsAt)}`],
                ["Modo de salvamento", currentStatus === "draft" ? "Rascunho ou planejamento" : "Atualização da viagem planejada"],
              ].map(([label, value]) => <div key={label} className="rounded-xl bg-muted p-4"><dt className="text-xs font-medium uppercase tracking-wide text-subtle-foreground">{label}</dt><dd className="mt-1 text-sm font-semibold leading-5 text-foreground">{value}</dd></div>)}
            </dl>
            {errorCount ? <div className="mt-5"><InlineAlert tone="warning">Revise os campos destacados nas seções anteriores.</InlineAlert></div> : <div className="mt-5"><InlineAlert tone="info">Salvar como rascunho permite completar os dados operacionais posteriormente.</InlineAlert></div>}
          </section>
        </div>
      </div>

      {!canPlan && currentStatus === "draft" ? <InlineAlert tone="warning">Cadastre um tipo de atendimento ativo para marcar a viagem como planejada.</InlineAlert> : null}

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm lg:sticky lg:bottom-3 lg:z-10">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{dirty ? "Existem alterações ainda não salvas." : mode === "create" ? "Preencha os dados para criar a viagem." : "Nenhuma alteração pendente."}</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Link href={cancelPath} onClick={confirmCancel} className={buttonStyles({ variant: "secondary" })}>Cancelar</Link>
            {currentStatus === "draft" ? <button type="submit" name="intent" value="draft" disabled={pending} className={buttonStyles({ variant: "secondary" })}>{pending ? "Salvando..." : "Salvar rascunho"}</button> : null}
            <button type="submit" name="intent" value={currentStatus === "draft" ? "planned" : "draft"} disabled={pending || (currentStatus === "draft" && !canPlan)} className={buttonStyles()}><Save aria-hidden="true" className="size-4" />{pending ? "Salvando..." : currentStatus === "draft" ? "Salvar e marcar como planejada" : "Salvar alterações"}</button>
          </div>
        </div>
      </div>
    </form>
  );
}

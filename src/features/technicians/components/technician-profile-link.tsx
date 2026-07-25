"use client";

import { useActionState, useState } from "react";

import { linkTechnicianProfileAction } from "@/features/technicians/actions/link-technician-profile-action";
import { unlinkTechnicianProfileAction } from "@/features/technicians/actions/unlink-technician-profile-action";
import type { EligibleProfile } from "@/features/technicians/types/technician";
import { SectionHeader } from "@/components/page/section-header";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";

export function TechnicianProfileLink({ organizationSlug, technicianId, profileId, profiles }: { organizationSlug: string; technicianId: string; profileId: string | null; profiles: EligibleProfile[] }) {
  const [confirming, setConfirming] = useState(false);
  const [linkState, linkAction, linkPending] = useActionState(linkTechnicianProfileAction.bind(null, organizationSlug, technicianId), { status: "idle", message: null });
  const [unlinkState, unlinkAction, unlinkPending] = useActionState(unlinkTechnicianProfileAction.bind(null, organizationSlug, technicianId), { status: "idle", message: null });
  const current = profiles.find((profile) => profile.id === profileId);
  return <section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><SectionHeader title="Acesso ao sistema" description="O vínculo associa este cadastro operacional a um usuário existente e é administrado separadamente do e-mail do técnico." />
    {profileId ? <div className="mt-5"><p className="text-sm text-foreground"><strong>Usuário vinculado:</strong> {current?.name ?? current?.email ?? "Usuário vinculado"}</p>{confirming ? <form action={unlinkAction} className="mt-4 space-y-3 rounded-xl border border-destructive/30 p-4"><p className="text-sm text-muted-foreground">Confirmar a desvinculação deste usuário?</p><div className="flex flex-col-reverse gap-2 sm:flex-row"><button type="button" disabled={unlinkPending} onClick={() => setConfirming(false)} className={buttonStyles({ variant: "secondary", size: "sm" })}>Cancelar</button><button disabled={unlinkPending} className={buttonStyles({ variant: "destructive", size: "sm" })}>{unlinkPending ? "Aguarde..." : "Desvincular"}</button></div></form> : <button type="button" onClick={() => setConfirming(true)} className={`${buttonStyles({ variant: "ghost", size: "sm" })} mt-3 text-destructive`}>Desvincular usuário</button>}{unlinkState.message ? <div className="mt-3"><InlineAlert tone={unlinkState.status === "error" ? "error" : "success"}>{unlinkState.message}</InlineAlert></div> : null}</div> : <form action={linkAction} className="mt-5 flex flex-col gap-3 sm:flex-row"><select name="profileId" required disabled={linkPending} className="h-11 flex-1 rounded-lg border border-input bg-card px-3 text-sm"><option value="">Selecione um usuário</option>{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name ?? profile.email ?? "Usuário elegível"}</option>)}</select><button disabled={linkPending || profiles.length === 0} className={buttonStyles()}>{linkPending ? "Vinculando..." : "Vincular"}</button>{profiles.length === 0 ? <p className="text-sm text-muted-foreground sm:self-center">Nenhum usuário elegível.</p> : null}</form>}
    {linkState.message ? <div className="mt-3"><InlineAlert tone={linkState.status === "error" ? "error" : "success"}>{linkState.message}</InlineAlert></div> : null}
  </section>;
}

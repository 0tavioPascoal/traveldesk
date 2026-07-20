"use client";

import { useActionState, useState } from "react";

import { linkTechnicianProfileAction } from "@/features/technicians/actions/link-technician-profile-action";
import { unlinkTechnicianProfileAction } from "@/features/technicians/actions/unlink-technician-profile-action";
import type { EligibleProfile } from "@/features/technicians/types/technician";

export function TechnicianProfileLink({ organizationSlug, technicianId, profileId, profiles }: { organizationSlug: string; technicianId: string; profileId: string | null; profiles: EligibleProfile[] }) {
  const [confirming, setConfirming] = useState(false);
  const [linkState, linkAction, linkPending] = useActionState(linkTechnicianProfileAction.bind(null, organizationSlug, technicianId), { status: "idle", message: null });
  const [unlinkState, unlinkAction, unlinkPending] = useActionState(unlinkTechnicianProfileAction.bind(null, organizationSlug, technicianId), { status: "idle", message: null });
  const current = profiles.find((profile) => profile.id === profileId);
  return <section className="rounded-xl border border-zinc-200 bg-white p-5"><h2 className="font-semibold text-zinc-950">Acesso ao sistema</h2><p className="mt-1 text-sm text-zinc-600">O vínculo associa este cadastro operacional a um usuário existente.</p>
    {profileId ? <div className="mt-4"><p className="text-sm text-zinc-800"><strong>Usuário vinculado:</strong> {current?.name ?? current?.email ?? profileId}</p>{confirming ? <form action={unlinkAction} className="mt-3 flex flex-wrap items-center gap-3"><span className="text-sm text-zinc-700">Confirmar desvinculação?</span><button type="button" onClick={() => setConfirming(false)} className="text-sm font-medium">Cancelar</button><button disabled={unlinkPending} className="text-sm font-medium text-red-700">{unlinkPending ? "Aguarde..." : "Desvincular"}</button></form> : <button type="button" onClick={() => setConfirming(true)} className="mt-3 text-sm font-medium text-red-700">Desvincular usuário</button>}{unlinkState.message ? <p className={`mt-2 text-sm ${unlinkState.status === "error" ? "text-red-700" : "text-emerald-700"}`}>{unlinkState.message}</p> : null}</div> : <form action={linkAction} className="mt-4 flex flex-col gap-3 sm:flex-row"><select name="profileId" required disabled={linkPending} className="h-10 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-sm"><option value="">Selecione um usuário</option>{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name ?? profile.email ?? profile.id}</option>)}</select><button disabled={linkPending || profiles.length === 0} className="h-10 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white disabled:opacity-50">{linkPending ? "Vinculando..." : "Vincular"}</button>{profiles.length === 0 ? <p className="text-sm text-zinc-500 sm:self-center">Nenhum usuário elegível.</p> : null}</form>}
    {linkState.message ? <p className={`mt-2 text-sm ${linkState.status === "error" ? "text-red-700" : "text-emerald-700"}`}>{linkState.message}</p> : null}
  </section>;
}

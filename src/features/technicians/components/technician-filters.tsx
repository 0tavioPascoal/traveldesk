"use client";

import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { ListActiveFilters } from "@/components/list-page/list-active-filters";
import {
  ListSearchField,
  listControlStyles,
} from "@/components/list-page/list-controls";
import {
  listToolbarSearchFormStyles,
  listToolbarUtilitiesStyles,
} from "@/components/list-page/list-toolbar";
import { buttonStyles } from "@/components/ui/button";
import type { TechnicianFilters as Values } from "@/features/technicians/types/technician";

type SkillOption = { id: string; name: string };

function FilterFields({
  filters,
  skills,
  prefix,
}: {
  filters: Values;
  skills: SkillOption[];
  prefix: string;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <label htmlFor={`${prefix}-status`} className="text-sm font-medium">
          Situação
        </label>
        <select
          id={`${prefix}-status`}
          name="status"
          defaultValue={filters.status}
          className={listControlStyles}
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${prefix}-skillId`} className="text-sm font-medium">
          Especialidade
        </label>
        <select
          id={`${prefix}-skillId`}
          name="skillId"
          defaultValue={filters.skillId}
          className={listControlStyles}
        >
          <option value="">Todas</option>
          {skills.map((skill) => (
            <option key={skill.id} value={skill.id}>
              {skill.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${prefix}-canDrive`} className="text-sm font-medium">
          Autorização para dirigir
        </label>
        <select
          id={`${prefix}-canDrive`}
          name="canDrive"
          defaultValue={filters.canDrive}
          className={listControlStyles}
        >
          <option value="all">Todos</option>
          <option value="yes">Autorizados</option>
          <option value="no">Não autorizados</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${prefix}-baseState`} className="text-sm font-medium">
          UF-base
        </label>
        <input
          id={`${prefix}-baseState`}
          name="baseState"
          maxLength={2}
          defaultValue={filters.baseState}
          placeholder="UF"
          className={`${listControlStyles} uppercase`}
        />
      </div>
    </>
  );
}

export function TechnicianFilters({
  organizationSlug,
  filters,
  skills,
}: {
  organizationSlug: string;
  filters: Values;
  skills: SkillOption[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const path = `/app/${organizationSlug}/cadastros/tecnicos`;
  const clearPath =
    filters.pageSize === 20 ? path : `${path}?pageSize=${filters.pageSize}`;
  const selectedSkill = skills.find(
    (skill) => skill.id === filters.skillId,
  )?.name;

  function hrefWithout(key: string) {
    const params = new URLSearchParams();
    if (filters.query && key !== "query") params.set("query", filters.query);
    if (filters.status !== "all" && key !== "status") {
      params.set("status", filters.status);
    }
    if (filters.skillId && key !== "skillId") {
      params.set("skillId", filters.skillId);
    }
    if (filters.canDrive !== "all" && key !== "canDrive") {
      params.set("canDrive", filters.canDrive);
    }
    if (filters.baseState && key !== "baseState") {
      params.set("baseState", filters.baseState);
    }
    if (filters.pageSize !== 20) params.set("pageSize", String(filters.pageSize));
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  }

  const activeItems = [
    filters.query
      ? { key: "query", label: `Pesquisa: ${filters.query}` }
      : null,
    filters.status !== "all"
      ? {
          key: "status",
          label:
            filters.status === "active"
              ? "Situação: Ativos"
              : "Situação: Inativos",
        }
      : null,
    selectedSkill
      ? { key: "skillId", label: `Especialidade: ${selectedSkill}` }
      : null,
    filters.canDrive !== "all"
      ? {
          key: "canDrive",
          label:
            filters.canDrive === "yes"
              ? "Autorizados a dirigir"
              : "Não autorizados a dirigir",
        }
      : null,
    filters.baseState
      ? { key: "baseState", label: `UF-base: ${filters.baseState}` }
      : null,
  ].filter((item): item is { key: string; label: string } => Boolean(item));

  return (
    <>
      <div className={listToolbarUtilitiesStyles}>
        <form action={path} className={listToolbarSearchFormStyles}>
          <input type="hidden" name="status" value={filters.status} />
          <input type="hidden" name="skillId" value={filters.skillId} />
          <input type="hidden" name="canDrive" value={filters.canDrive} />
          <input type="hidden" name="baseState" value={filters.baseState} />
          <input type="hidden" name="pageSize" value={filters.pageSize} />
          <ListSearchField
            id="mobile-technician-query"
            label="Pesquisar"
            placeholder="Pesquisar técnico..."
            defaultValue={filters.query}
            compact
          />
        </form>
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className={`${buttonStyles({ variant: "secondary", size: "sm" })} shrink-0`}
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          Filtros
          {activeItems.filter((item) => item.key !== "query").length
            ? ` (${activeItems.filter((item) => item.key !== "query").length})`
            : ""}
        </button>
      </div>

      <ListActiveFilters
        items={activeItems.map((item) => ({
          ...item,
          href: hrefWithout(item.key),
        }))}
        clearHref={clearPath}
      />

      <dialog
        ref={dialogRef}
        aria-labelledby="technician-filters-title"
        className="m-auto max-h-[min(42rem,calc(100dvh-2rem))] w-[min(32rem,calc(100%-2rem))] overflow-y-auto rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <form action={path} className="space-y-5 p-5">
          <input type="hidden" name="query" value={filters.query} />
          <input type="hidden" name="pageSize" value={filters.pageSize} />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="technician-filters-title"
                className="text-lg font-semibold"
              >
                Filtrar técnicos
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Combine situação, especialidade, habilitação e localidade.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Fechar filtros"
              className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="grid gap-4">
            <FilterFields filters={filters} skills={skills} prefix="panel" />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {activeItems.length ? (
              <Link
                href={clearPath}
                className={buttonStyles({ variant: "secondary" })}
              >
                Limpar filtros
              </Link>
            ) : null}
            <button type="submit" className={buttonStyles()}>
              Aplicar filtros
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

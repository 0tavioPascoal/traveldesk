import {
  Building2,
  CalendarOff,
  CarFront,
  ClipboardList,
  LayoutDashboard,
  Route,
  ShieldCheck,
  Tags,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { OrganizationRole } from "@/features/organizations/types/organization";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavigationSection = {
  label?: string;
  items: NavigationItem[];
};

export function getNavigationSections(organizationSlug: string, role: OrganizationRole): NavigationSection[] {
  const base = `/app/${organizationSlug}`;

  if (role === "technician") {
    return [{ items: [{ href: `${base}/dashboard`, label: "Início", icon: LayoutDashboard }] }];
  }

  const sections: NavigationSection[] = [
    { items: [{ href: `${base}/dashboard`, label: "Visão geral", icon: LayoutDashboard }] },
    {
      label: "Planejamento",
      items: [
        { href: `${base}/planejamento/viagens`, label: "Viagens", icon: Route },
        { href: `${base}/planejamento/indisponibilidades`, label: "Indisponibilidades", icon: CalendarOff },
      ],
    },
    {
      label: "Cadastros",
      items: [
        { href: `${base}/cadastros/clientes`, label: "Clientes", icon: Building2 },
        { href: `${base}/cadastros/tecnicos`, label: "Técnicos", icon: UsersRound },
        { href: `${base}/cadastros/veiculos`, label: "Veículos", icon: CarFront },
        { href: `${base}/cadastros/especialidades`, label: "Especialidades", icon: Wrench },
        { href: `${base}/cadastros/tipos-atendimento`, label: "Tipos de atendimento", icon: ClipboardList },
        { href: `${base}/cadastros/tipos-indisponibilidade`, label: "Tipos de indisponibilidade", icon: Tags },
      ],
    },
  ];

  if (role === "admin") {
    sections.push({
      label: "Administração",
      items: [
        { href: `${base}/administracao`, label: "Organização e acessos", icon: ShieldCheck },
      ],
    });
  }

  return sections;
}

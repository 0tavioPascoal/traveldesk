import {
  Building2,
  CalendarRange,
  CalendarOff,
  CarFront,
  ClipboardList,
  LayoutDashboard,
  ChartNoAxesCombined,
  MapPin,
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
    {
      label: "Visão geral",
      items: [
        { href: `${base}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
        { href: `${base}/analises`, label: "Análises", icon: ChartNoAxesCombined },
      ],
    },
    {
      label: "Planejamento",
      items: [
        { href: `${base}/planejamento/viagens`, label: "Viagens", icon: Route },
        { href: `${base}/planejamento/escala`, label: "Escalas", icon: CalendarRange },
        { href: `${base}/planejamento/indisponibilidades`, label: "Indisponibilidades", icon: CalendarOff },
      ],
    },
    {
      label: "Cadastros",
      items: [
        { href: `${base}/cadastros/clientes`, label: "Clientes", icon: Building2 },
        { href: `${base}/cadastros/unidades`, label: "Unidades", icon: MapPin },
        { href: `${base}/cadastros/tecnicos`, label: "Técnicos", icon: UsersRound },
        { href: `${base}/cadastros/veiculos`, label: "Veículos", icon: CarFront },
      ],
    },
    {
      label: "Catálogos",
      items: [
        { href: `${base}/cadastros/especialidades`, label: "Especialidades", icon: Wrench },
        { href: `${base}/cadastros/tipos-atendimento`, label: "Tipos de atendimento", icon: ClipboardList },
        { href: `${base}/cadastros/tipos-indisponibilidade/tecnicos`, label: "Tipos para técnicos", icon: Tags },
        { href: `${base}/cadastros/tipos-indisponibilidade/veiculos`, label: "Tipos para veículos", icon: Tags },
      ],
    },
  ];

  if (role === "admin") {
    sections.push({
      label: "Administração",
      items: [
        { href: `${base}/administracao#organizacao`, label: "Organização", icon: ShieldCheck },
        { href: `${base}/administracao#membros`, label: "Membros e acessos", icon: UsersRound },
      ],
    });
  }

  return sections;
}

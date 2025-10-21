'use client'

import Link from "next/link"
import { LayoutDashboard, LogOut, Settings, Users, FileText, ClipboardList } from "lucide-react"

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { useActivePath } from "@/hooks/use-active-path"

const navItems = [
  { href: "/painel", icon: LayoutDashboard, label: "Painel" },
  { href: "/clientes", icon: Users, label: "Clientes" },
  { href: "/propostas", icon: FileText, label: "Propostas" },
  { href: "/atividades", icon: ClipboardList, label: "Atividades" },
]

export function NavMenu() {
  const checkActivePath = useActivePath()

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={checkActivePath(item.href)}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

export function SettingsMenu() {
  return (
    <SidebarMenu>
        <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Configurações">
                <Link href="#">
                    <Settings />
                    <span>Configurações</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Sair">
                <Link href="#">
                    <LogOut />
                    <span>Sair</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    </SidebarMenu>
  )
}

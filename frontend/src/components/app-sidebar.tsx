import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MessagesSquare,
  CalendarDays,
  Users,
  BookOpen,
  Tag,
  UserCircle,
  LogOut,
  Bot,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { clearAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

const main = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard, exact: true },
  { title: "Conversas", url: "/app/conversas", icon: MessagesSquare },
  { title: "Agenda", url: "/app/agenda", icon: CalendarDays },
  { title: "Meu Assistente", url: "/app/assistente", icon: Bot },
];

const config = [
  { title: "Usuários", url: "/app/configuracoes/usuarios", icon: Users },
  { title: "Minha clínica", url: "/app/configuracoes/conhecimento", icon: BookOpen },
  { title: "Pacientes", url: "/app/configuracoes/clientes", icon: UserCircle },
  { title: "Etiquetas", url: "/app/configuracoes/etiquetas", icon: Tag },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isActive = (url: string, exact?: boolean) =>
    exact ? path === url : path === url || path.startsWith(url + "/");

  const handleLogout = () => {
    clearAuth();
    navigate({ to: "/login" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex h-12 w-12 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 items-center justify-center rounded-full bg-white border border-sidebar-border shadow-sm overflow-hidden flex-shrink-0 transition-all">
            <img src="/logo-icon.png" alt="Clínica Simioni" className="h-10 w-10 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6 object-contain transition-all" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-display text-base font-bold leading-tight">Clínica Simioni</span>
            <span className="text-xs text-sidebar-foreground/60">Gestão clínica</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((it) => (
                <SidebarMenuItem key={it.url}>
                  <SidebarMenuButton asChild isActive={isActive(it.url, it.exact)} tooltip={it.title}>
                    <Link to={it.url}>
                      <it.icon />
                      <span>{it.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {config.map((it) => (
                <SidebarMenuItem key={it.url}>
                  <SidebarMenuButton asChild isActive={isActive(it.url)} tooltip={it.title}>
                    <Link to={it.url}>
                      <it.icon />
                      <span>{it.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Sair">
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

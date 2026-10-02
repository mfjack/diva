"use client";

import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getInitials } from "@/lib/get-initials";
import { ROUTES } from "@/lib/routes";
import {
  PSYCHOLOGIST_NAVIGATION,
  PSYCHOLOGIST_SETTINGS_ITEM,
} from "./psychologist-navigation";
import { SidebarLink } from "./sidebar-link";

type PsychologistSidebarProps = {
  psychologistName: string;
  professionalRegistration: string;
};

export function PsychologistSidebar({
  psychologistName,
  professionalRegistration,
}: PsychologistSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center px-4 group-data-[collapsible=icon]:px-2">
        <Logo
          href={ROUTES.psychologist.dashboard}
          className="group-data-[collapsible=icon]:hidden"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {PSYCHOLOGIST_NAVIGATION.map((item) => (
                <SidebarLink key={item.href} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-3">
        <SidebarMenu>
          <SidebarLink {...PSYCHOLOGIST_SETTINGS_ITEM} />
        </SidebarMenu>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-3 rounded-lg p-1.5">
            <Avatar className="size-8 rounded-lg after:hidden">
              <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {getInitials(psychologistName)}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium text-sidebar-accent-foreground text-sm">
                {psychologistName}
              </span>
              <span className="truncate text-xs">
                {professionalRegistration}
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

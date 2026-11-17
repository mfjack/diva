"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { getInitials } from "@/lib/get-initials";
import { ROUTES } from "@/lib/routes";
import {
  PSYCHOLOGIST_NAVIGATION,
  PSYCHOLOGIST_SETTINGS_ITEM,
} from "./psychologist-navigation";
import { SidebarLink } from "./sidebar-link";

type PsychologistSidebarProps = {
  psychologistName: string;
  professionalRegistration: string | null;
  avatarUrl: string | null;
};

export function PsychologistSidebar({
  psychologistName,
  professionalRegistration,
  avatarUrl,
}: PsychologistSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-4">
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
              {avatarUrl && (
                <AvatarImage
                  src={avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="rounded-lg"
                />
              )}
              <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {getInitials(psychologistName)}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium text-sidebar-accent-foreground text-sm">
                {psychologistName}
              </span>
              {professionalRegistration ? (
                <span className="truncate text-xs">
                  {professionalRegistration}
                </span>
              ) : (
                <Link
                  href={ROUTES.psychologist.settings}
                  className="truncate text-warning text-xs underline-offset-4 hover:underline"
                >
                  Adicione seu CRP
                </Link>
              )}
            </div>
            <SignOutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

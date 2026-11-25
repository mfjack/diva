"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type SidebarLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  isExact?: boolean;
};

export function SidebarLink({
  href,
  label,
  icon: Icon,
  isExact = false,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const isActive = isExact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={label}
        className="h-10 gap-3 px-3 group-data-[collapsible=icon]:p-1.5! [&_svg]:size-5 data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground"
        render={
          <Link
            href={href}
            aria-current={isActive ? "page" : undefined}
            onClick={() => setOpenMobile(false)}
          />
        }
      >
        <Icon aria-hidden />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/get-initials";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  isNavigationItemActive,
  PATIENT_NAVIGATION,
} from "./patient-navigation";

type PatientHeaderProps = {
  patientName: string;
};

export function PatientHeader({ patientName }: PatientHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-8 px-4 md:px-8">
        <Logo href={ROUTES.patient.home} />
        <nav aria-label="Navegação principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {PATIENT_NAVIGATION.map((item) => {
              const isActive = isNavigationItemActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2 font-medium text-sm transition-colors",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Avatar className="ml-auto size-9">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {getInitials(patientName)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

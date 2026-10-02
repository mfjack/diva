import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageContentProps = {
  children: ReactNode;
  className?: string;
};

export function PageContent({ children, className }: PageContentProps) {
  return (
    <main
      className={cn(
        "flex flex-1 flex-col gap-8 px-4 pt-6 pb-24 md:px-8 md:pb-10",
        className,
      )}
    >
      {children}
    </main>
  );
}

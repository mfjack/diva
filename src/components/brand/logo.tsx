import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href: string;
  className?: string;
};

export function Logo({ href, className }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Divã, página inicial"
      className={cn(
        "font-heading font-semibold text-2xl text-primary leading-none tracking-tight",
        className,
      )}
    >
      Divã
    </Link>
  );
}

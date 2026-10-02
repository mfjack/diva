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
        "font-heading text-2xl leading-none tracking-tight",
        className,
      )}
    >
      Divã
    </Link>
  );
}

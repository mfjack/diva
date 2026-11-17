import type { ReactNode } from "react";

type DetailsSectionProps = {
  title: string;
  children: ReactNode;
};

export function DetailsSection({ title, children }: DetailsSectionProps) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {title}
      </h3>
      <dl className="divide-y text-sm">{children}</dl>
    </section>
  );
}

type DetailItemProps = {
  label: string;
  children: ReactNode;
};

export function DetailItem({ label, children }: DetailItemProps) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-2 text-right">{children}</dd>
    </div>
  );
}

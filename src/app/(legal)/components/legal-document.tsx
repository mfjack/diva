import type { ReactNode } from "react";
import { LEGAL_DOCUMENTS_UPDATED_AT } from "@/lib/legal";

type LegalDocumentProps = {
  title: string;
  summary: string;
  children: ReactNode;
};

export function LegalDocument({
  title,
  summary,
  children,
}: LegalDocumentProps) {
  return (
    <article className="flex flex-col gap-8 rounded-2xl border bg-card p-6 text-sm leading-relaxed shadow-xs sm:p-10">
      <header className="flex flex-col gap-2 border-b pb-6">
        <h1 className="font-heading font-semibold text-2xl tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground">{summary}</p>
        <p className="text-muted-foreground text-xs">
          Atualizado em {LEGAL_DOCUMENTS_UPDATED_AT}
        </p>
      </header>
      {children}
    </article>
  );
}

type LegalSectionProps = {
  title: string;
  children: ReactNode;
};

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold text-base">{title}</h2>
      <div className="flex flex-col gap-3 text-foreground/90">{children}</div>
    </section>
  );
}

type LegalListProps = {
  items: readonly ReactNode[];
};

export function LegalList({ items }: LegalListProps) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5">
      {items.map((item, index) => (
        <li key={`legal-item-${index.toString()}`}>{item}</li>
      ))}
    </ul>
  );
}

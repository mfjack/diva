import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 px-4 pt-8 pb-2 sm:flex-row sm:items-end md:px-8">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1 className="font-heading text-4xl leading-tight tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </header>
  );
}

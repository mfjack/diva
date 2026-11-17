import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="sticky top-14 z-10 flex shrink-0 flex-col gap-4 border-b bg-background px-4 py-5 sm:flex-row sm:items-center md:top-0 md:px-8">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1 className="font-heading font-semibold text-lg leading-tight tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-xs">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </header>
  );
}

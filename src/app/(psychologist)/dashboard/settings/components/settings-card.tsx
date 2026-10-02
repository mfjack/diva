import type { FormEventHandler, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type SettingsCardProps = {
  title: string;
  description: string;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
};

export function SettingsCard({
  title,
  description,
  isSubmitting,
  onSubmit,
  children,
}: SettingsCardProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex max-w-4xl flex-col rounded-xl border"
    >
      <header className="flex flex-col gap-1 border-b p-5 md:p-6">
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </header>
      <div className="p-5 md:p-6">{children}</div>
      <footer className="flex justify-end border-t bg-muted/40 px-5 py-4 md:px-6">
        <Button
          type="submit"
          className="h-10 px-5"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting && <Spinner aria-hidden />}
          Salvar alterações
        </Button>
      </footer>
    </form>
  );
}

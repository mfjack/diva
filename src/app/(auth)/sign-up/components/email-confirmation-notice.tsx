import { MailCheck } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

type EmailConfirmationNoticeProps = {
  email: string;
};

export function EmailConfirmationNotice({
  email,
}: EmailConfirmationNoticeProps) {
  return (
    <section aria-live="polite" className="flex flex-col gap-5">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <MailCheck className="size-6" aria-hidden />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-heading font-semibold text-xl">
          Confirme seu email
        </h2>
        <p className="text-muted-foreground text-sm">
          Enviamos um link de confirmação para{" "}
          <strong className="font-medium text-foreground">{email}</strong>. Abra
          o email para ativar sua conta.
        </p>
      </div>
      <Link
        href={ROUTES.login}
        className="font-medium text-primary text-sm hover:underline"
      >
        Voltar para o login
      </Link>
    </section>
  );
}

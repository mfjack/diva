import { ArrowRight, Stethoscope, UserRound } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const AREAS = [
  {
    href: ROUTES.psychologist.dashboard,
    title: "Área da psicóloga",
    description: "Agenda, pacientes, financeiro, prontuários e configurações.",
    icon: Stethoscope,
  },
  {
    href: ROUTES.patient.home,
    title: "Área do paciente",
    description: "Agendar sessões, cancelar com motivo e ver pagamentos.",
    icon: UserRound,
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-4 py-16">
      <div className="flex flex-col gap-3">
        <p className="font-heading text-6xl tracking-tight">Divã</p>
        <p className="max-w-md text-muted-foreground">
          Escolha uma área para navegar pelas telas. O login entra quando o
          backend estiver pronto.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {AREAS.map(({ href, title, description, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full flex-col gap-6 rounded-xl border bg-card p-6 transition-colors hover:border-primary"
            >
              <Icon aria-hidden className="size-6 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 font-semibold text-lg">
                  {title}
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
                <span className="text-muted-foreground text-sm">
                  {description}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

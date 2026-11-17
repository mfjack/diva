import { House, SearchX } from "lucide-react";
import Link from "next/link";
import { StatusMessage } from "@/components/feedback/status-message";
import { Button } from "@/components/ui/button";

type RouteNotFoundProps = {
  homeHref: string;
};

export function RouteNotFound({ homeHref }: RouteNotFoundProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <StatusMessage
          icon={SearchX}
          title="Página não encontrada"
          description="O endereço pode estar errado ou o registro não existe mais."
          action={
            <Button nativeButton={false} render={<Link href={homeHref} />}>
              <House aria-hidden />
              Voltar ao início
            </Button>
          }
        />
      </div>
    </div>
  );
}

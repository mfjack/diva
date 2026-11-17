"use client";

import { RotateCw, TriangleAlert } from "lucide-react";
import { StatusMessage } from "@/components/feedback/status-message";
import { Button } from "@/components/ui/button";

type RouteErrorProps = {
  retry: () => void;
};

export function RouteError({ retry }: RouteErrorProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <StatusMessage
          icon={TriangleAlert}
          title="Algo deu errado"
          description="Não foi possível carregar esta tela. Confira a internet e tente de novo."
          action={
            <Button type="button" variant="outline" onClick={retry}>
              <RotateCw aria-hidden />
              Tentar de novo
            </Button>
          }
        />
      </div>
    </div>
  );
}

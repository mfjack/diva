"use client";

import { CalendarOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialog/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useDeleteAvailabilityBlockMutation } from "@/features/practice-settings/hooks/use-delete-availability-block-mutation";
import type { AvailabilityBlock } from "@/features/practice-settings/types";
import { formatDateTime } from "@/lib/format";
import { AvailabilityBlockDialog } from "./availability-block-dialog";

type AvailabilityBlocksViewProps = {
  initialBlocks: AvailabilityBlock[];
};

export function AvailabilityBlocksView({
  initialBlocks,
}: AvailabilityBlocksViewProps) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<AvailabilityBlock | null>(
    null,
  );
  const deleteBlockMutation = useDeleteAvailabilityBlockMutation();

  function handleCreated(block: AvailabilityBlock) {
    setBlocks((currentBlocks) =>
      [...currentBlocks, block].sort((first, second) =>
        first.startsAt.localeCompare(second.startsAt),
      ),
    );
  }

  function handleDelete() {
    if (!blockToDelete) return;
    deleteBlockMutation.mutate(blockToDelete.id, {
      onSuccess: () => {
        setBlocks((currentBlocks) =>
          currentBlocks.filter(({ id }) => id !== blockToDelete.id),
        );
        setBlockToDelete(null);
        toast.success("Bloqueio removido.");
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-lg">Bloqueios na agenda</h2>
          <p className="text-muted-foreground text-sm">
            Férias, congressos e compromissos. Nesses períodos ninguém consegue
            agendar.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus aria-hidden />
          Novo bloqueio
        </Button>
      </div>

      {blocks.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarOff aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Nenhum bloqueio</EmptyTitle>
            <EmptyDescription>
              Sua agenda segue os horários de atendimento normalmente.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="divide-y rounded-xl border px-4">
          {blocks.map((block) => (
            <li key={block.id} className="flex items-center gap-4 py-3.5">
              <CalendarOff
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">
                  {block.reason ?? "Bloqueio"}
                </span>
                <span className="text-muted-foreground text-sm">
                  {formatDateTime(block.startsAt)} até{" "}
                  {formatDateTime(block.endsAt)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Remover bloqueio ${block.reason ?? ""}`}
                onClick={() => setBlockToDelete(block)}
              >
                <Trash2 aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AvailabilityBlockDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onCreated={handleCreated}
      />
      <ConfirmDialog
        isOpen={blockToDelete !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setBlockToDelete(null);
        }}
        title="Remover bloqueio?"
        description="Os horários desse período voltam a ficar disponíveis para agendamento."
        confirmLabel="Remover"
        isConfirming={deleteBlockMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

"use client";

import { CalendarX2 } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";
import { FilterSelect } from "@/components/filter-select";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { APPOINTMENT_STATUS_LABELS } from "@/features/appointments/labels";
import type { AppointmentStatus } from "@/features/appointments/types";
import {
  getSessionPaymentFilter,
  SESSION_PAYMENT_FILTER_LABELS,
  SESSION_PAYMENT_FILTERS,
  type SessionHistoryEntry,
} from "../session-history";
import { PatientSessionsTable } from "./patient-sessions-table";

const SESSION_STATUSES = [
  "scheduled",
  "confirmed",
  "completed",
  "no_show",
  "cancelled",
] as const satisfies readonly AppointmentStatus[];

const SESSION_STATUS_OPTIONS = SESSION_STATUSES.map((status) => ({
  value: status,
  label: APPOINTMENT_STATUS_LABELS[status],
}));

const SESSION_PAYMENT_OPTIONS = SESSION_PAYMENT_FILTERS.map((filter) => ({
  value: filter,
  label: SESSION_PAYMENT_FILTER_LABELS[filter],
}));

const FILTER_OPTIONS = { history: "replace" } as const;

type PatientSessionsViewProps = {
  entries: SessionHistoryEntry[];
  className?: string;
};

function findOption<TValue extends string>(
  values: readonly TValue[],
  value: string | null,
): TValue | null {
  return values.find((option) => option === value) ?? null;
}

export function PatientSessionsView({
  entries,
  className,
}: PatientSessionsViewProps) {
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsStringLiteral(SESSION_STATUSES).withOptions(FILTER_OPTIONS),
  );
  const [paymentFilter, setPaymentFilter] = useQueryState(
    "payment",
    parseAsStringLiteral(SESSION_PAYMENT_FILTERS).withOptions(FILTER_OPTIONS),
  );
  const hasFilter = statusFilter !== null || paymentFilter !== null;

  const filteredEntries = useMemo(() => {
    const now = new Date();
    return entries.filter(
      ({ appointment, payment }) =>
        (!statusFilter || appointment.status === statusFilter) &&
        (!paymentFilter ||
          getSessionPaymentFilter(payment, now) === paymentFilter),
    );
  }, [entries, statusFilter, paymentFilter]);

  function handleClearFilters() {
    setStatusFilter(null);
    setPaymentFilter(null);
  }

  return (
    <PatientSessionsTable
      entries={filteredEntries}
      className={className}
      toolbarActions={
        <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
          <div className="sm:w-44">
            <FilterSelect
              label="Filtrar por status da sessão"
              allLabel="Todas as sessões"
              value={statusFilter}
              options={SESSION_STATUS_OPTIONS}
              onChange={(value) =>
                setStatusFilter(findOption(SESSION_STATUSES, value))
              }
            />
          </div>
          <div className="sm:w-44">
            <FilterSelect
              label="Filtrar por pagamento"
              allLabel="Todos os pagamentos"
              value={paymentFilter}
              options={SESSION_PAYMENT_OPTIONS}
              onChange={(value) =>
                setPaymentFilter(findOption(SESSION_PAYMENT_FILTERS, value))
              }
            />
          </div>
        </div>
      }
      emptyState={
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarX2 aria-hidden />
            </EmptyMedia>
            <EmptyTitle>
              {hasFilter
                ? "Nenhuma sessão nesse filtro"
                : "Nenhuma sessão ainda"}
            </EmptyTitle>
            <EmptyDescription>
              {hasFilter
                ? "Troque os filtros para ver outras sessões."
                : "As sessões aparecem aqui depois de agendadas."}
            </EmptyDescription>
          </EmptyHeader>
          {hasFilter && (
            <EmptyContent>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpar filtros
              </Button>
            </EmptyContent>
          )}
        </Empty>
      }
    />
  );
}

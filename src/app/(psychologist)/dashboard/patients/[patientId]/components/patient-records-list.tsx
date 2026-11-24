import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { EmptyListMessage } from "@/components/feedback/empty-list-message";
import type { ClinicalRecordSummary } from "@/features/clinical-records/types";
import { formatDate } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

type PatientRecordsListProps = {
  records: ClinicalRecordSummary[];
};

export function PatientRecordsList({ records }: PatientRecordsListProps) {
  if (records.length === 0) {
    return <EmptyListMessage message="Nenhuma anotação no prontuário." />;
  }

  return (
    <ul className="divide-y rounded-xl border">
      {records.map((record) => (
        <li key={record.id}>
          <Link
            href={`${ROUTES.psychologist.records}/${record.id}`}
            className="flex items-center gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted/60"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{record.title}</span>
              <span className="text-muted-foreground text-xs">
                {record.sessionStartsAt
                  ? `Sessão de ${formatDate(record.sessionStartsAt)}`
                  : `Atualizada em ${formatDate(record.updatedAt)}`}
              </span>
            </div>
            <ChevronRight
              aria-hidden
              className="size-4 text-muted-foreground"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

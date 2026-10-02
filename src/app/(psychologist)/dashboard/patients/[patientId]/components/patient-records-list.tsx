import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { EmptyListMessage } from "@/components/feedback/empty-list-message";
import { CLINICAL_RECORD_KIND_LABELS } from "@/features/clinical-records/labels";
import type { ClinicalRecord } from "@/features/clinical-records/types";
import { formatDate } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

type PatientRecordsListProps = {
  records: ClinicalRecord[];
};

export function PatientRecordsList({ records }: PatientRecordsListProps) {
  if (records.length === 0) {
    return <EmptyListMessage message="Nenhum documento no prontuário." />;
  }

  return (
    <ul className="divide-y rounded-xl border">
      {records.map((record) => (
        <li key={record.id}>
          <Link
            href={`${ROUTES.psychologist.records}/${record.id}`}
            className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/60"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{record.title}</span>
              <span className="text-muted-foreground text-xs">
                {CLINICAL_RECORD_KIND_LABELS[record.kind]} ·{" "}
                {formatDate(record.updatedAt)}
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

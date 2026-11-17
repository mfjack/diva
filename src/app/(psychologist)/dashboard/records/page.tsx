import { FilePlus2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { listClinicalRecords } from "@/features/clinical-records/queries";
import { ROUTES } from "@/lib/routes";
import { RecordsTable } from "./components/records-table";

export const metadata: Metadata = {
  title: "Prontuários",
};

export default async function RecordsPage() {
  const records = await listClinicalRecords();

  return (
    <div className="flex flex-1 flex-col md:h-svh md:flex-none md:overflow-hidden">
      <PageHeader
        title="Prontuários"
        description="Evoluções, laudos, declarações e encaminhamentos. Conteúdo criptografado e visível só para você."
        actions={
          <Button
            nativeButton={false}
            render={<Link href={`${ROUTES.psychologist.records}/new`} />}
          >
            <FilePlus2 aria-hidden />
            Novo documento
          </Button>
        }
      />
      <PageContent className="md:min-h-0 md:pb-6">
        <RecordsTable records={records} />
      </PageContent>
    </div>
  );
}

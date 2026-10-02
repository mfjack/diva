import {
  CircleDollarSign,
  Hourglass,
  ReceiptText,
  TriangleAlert,
} from "lucide-react";
import type { Metadata } from "next";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { StatCard } from "@/components/stat-card";
import { RevenueChart } from "@/features/payments/components/revenue-chart";
import {
  getFinanceSummary,
  listMonthlyRevenue,
  listPayments,
} from "@/features/payments/queries";
import { getPracticeSettings } from "@/features/practice-settings/queries";
import { formatCurrency } from "@/lib/format";
import { PaymentsView } from "./components/payments-view";

export const metadata: Metadata = {
  title: "Financeiro",
};

export default async function FinancePage() {
  const [summary, monthlyRevenue, payments, settings] = await Promise.all([
    getFinanceSummary(),
    listMonthlyRevenue(),
    listPayments(),
    getPracticeSettings(),
  ]);

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Recebimentos, pendências e recibos das sessões"
      />
      <PageContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Recebido em 30 dias"
            value={formatCurrency(summary.receivedCents)}
            icon={CircleDollarSign}
            isHighlighted
          />
          <StatCard
            label="A receber"
            value={formatCurrency(summary.pendingCents)}
            hint={`${summary.pendingCount} sessões`}
            icon={Hourglass}
          />
          <StatCard
            label="Em atraso"
            value={formatCurrency(summary.overdueCents)}
            hint="Pendentes há mais de 7 dias"
            icon={TriangleAlert}
          />
          <StatCard
            label="Ticket médio"
            value={formatCurrency(summary.averageTicketCents)}
            hint="Por sessão paga"
            icon={ReceiptText}
          />
        </div>

        <Section title="Receita mensal" description="Recebido e a receber">
          <div className="rounded-xl border p-4">
            <RevenueChart data={monthlyRevenue} />
          </div>
        </Section>

        <Section title="Pagamentos">
          <PaymentsView initialPayments={payments} pixKey={settings.pixKey} />
        </Section>
      </PageContent>
    </>
  );
}

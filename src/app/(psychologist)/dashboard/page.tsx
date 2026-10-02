import {
  CalendarCheck,
  CalendarX2,
  CircleDollarSign,
  Hourglass,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyListMessage } from "@/components/feedback/empty-list-message";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { AppointmentRow } from "@/features/appointments/components/appointment-row";
import {
  listRecentCancellations,
  listTodayAppointments,
  listWeekAppointments,
} from "@/features/appointments/queries";
import { RevenueChart } from "@/features/payments/components/revenue-chart";
import {
  getFinanceSummary,
  listMonthlyRevenue,
  listPendingPayments,
} from "@/features/payments/queries";
import { getPracticeSettings } from "@/features/practice-settings/queries";
import { formatCurrency, formatLongDate } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { CancellationList } from "./components/cancellation-list";
import { getGreeting } from "./components/greeting";
import { PendingPaymentList } from "./components/pending-payment-list";

export const metadata: Metadata = {
  title: "Painel",
};

const PENDING_PAYMENTS_PREVIEW = 4;
const RECENT_CANCELLATIONS_PREVIEW = 3;

export default async function DashboardPage() {
  const [
    settings,
    todayAppointments,
    weekAppointments,
    financeSummary,
    monthlyRevenue,
    pendingPayments,
    recentCancellations,
  ] = await Promise.all([
    getPracticeSettings(),
    listTodayAppointments(),
    listWeekAppointments(),
    getFinanceSummary(),
    listMonthlyRevenue(),
    listPendingPayments(),
    listRecentCancellations(RECENT_CANCELLATIONS_PREVIEW),
  ]);

  const firstName = settings.psychologistName.split(" ")[0] ?? "";
  const activeWeekAppointments = weekAppointments.filter(
    ({ status }) => status !== "cancelled",
  );
  const lateCancellationCount = recentCancellations.filter(
    ({ cancellation }) => cancellation?.isLateCancellation,
  ).length;

  return (
    <>
      <PageHeader
        title={`${getGreeting(new Date())}, ${firstName}`}
        description={formatLongDate(new Date())}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={ROUTES.psychologist.schedule} />}
          >
            Ver agenda
          </Button>
        }
      />
      <PageContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Recebido em 30 dias"
            value={formatCurrency(financeSummary.receivedCents)}
            hint={`Ticket médio de ${formatCurrency(financeSummary.averageTicketCents)}`}
            icon={CircleDollarSign}
            isHighlighted
          />
          <StatCard
            label="A receber"
            value={formatCurrency(financeSummary.pendingCents)}
            hint={`${financeSummary.pendingCount} sessões aguardando pagamento`}
            icon={Hourglass}
          />
          <StatCard
            label="Próximos 7 dias"
            value={String(activeWeekAppointments.length)}
            hint="sessões agendadas"
            icon={CalendarCheck}
          />
          <StatCard
            label="Cancelamentos recentes"
            value={String(recentCancellations.length)}
            hint={`${lateCancellationCount} com menos de ${settings.cancellationNoticeHours}h de aviso`}
            icon={CalendarX2}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="flex flex-col gap-8 lg:col-span-3">
            <Section
              title="Hoje"
              description={`${todayAppointments.length} sessões`}
            >
              {todayAppointments.length > 0 ? (
                <div className="divide-y rounded-xl border px-4">
                  {todayAppointments.map((appointment) => (
                    <AppointmentRow
                      key={appointment.id}
                      appointment={appointment}
                      isPaymentVisible
                    />
                  ))}
                </div>
              ) : (
                <EmptyListMessage message="Nenhuma sessão hoje." />
              )}
            </Section>

            <Section
              title="Pagamentos pendentes"
              action={
                <Button
                  variant="link"
                  className="px-0"
                  nativeButton={false}
                  render={<Link href={ROUTES.psychologist.finance} />}
                >
                  Ver financeiro
                </Button>
              }
            >
              <PendingPaymentList
                payments={pendingPayments.slice(0, PENDING_PAYMENTS_PREVIEW)}
              />
            </Section>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-2">
            <Section title="Receita" description="Últimos seis meses">
              <div className="rounded-xl border p-4">
                <RevenueChart data={monthlyRevenue} />
              </div>
            </Section>

            <Section title="Cancelamentos recentes">
              <CancellationList appointments={recentCancellations} />
            </Section>
          </div>
        </div>
      </PageContent>
    </>
  );
}

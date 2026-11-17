import { CalendarClock, CircleDollarSign, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { StatCard } from "@/components/stat-card";
import { summarizeMonthExpenses } from "@/features/expenses/occurrences";
import { getMonthExpenses } from "@/features/expenses/queries";
import { RevenueChart } from "@/features/payments/components/revenue-chart";
import {
  getMonthPaymentSummary,
  listMonthlyRevenue,
  listPaymentsBetween,
} from "@/features/payments/queries";
import { getPracticeSettings } from "@/features/practice-settings/queries";
import { toDateKey } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { getCurrentMonthKey, getMonthRange, isMonthKey } from "@/lib/months";
import { getSingleSearchParam } from "@/lib/search-params";
import { ExpensesBoard } from "./components/expenses-board";
import { MonthNavigator } from "./components/month-navigator";
import { MonthResultCard } from "./components/month-result-card";
import { NewExpenseButton } from "./components/new-expense-button";
import { PaymentsView } from "./components/payments-view";

export const metadata: Metadata = {
  title: "Financeiro",
};

function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default async function FinancePage({
  searchParams,
}: PageProps<"/dashboard/finance">) {
  const monthParam = getSingleSearchParam((await searchParams).month);
  const monthKey = isMonthKey(monthParam) ? monthParam : getCurrentMonthKey();
  const range = getMonthRange(monthKey);

  const [paymentSummary, expenseGroups, monthlyRevenue, payments, settings] =
    await Promise.all([
      getMonthPaymentSummary(range),
      getMonthExpenses(range),
      listMonthlyRevenue(),
      listPaymentsBetween(range),
      getPracticeSettings(),
    ]);
  const expenseSummary = summarizeMonthExpenses(expenseGroups, range);

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Recebimentos, contas e resultado do mês"
        actions={
          <>
            <MonthNavigator monthKey={monthKey} />
            <NewExpenseButton />
          </>
        }
      />
      <PageContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Recebido no mês"
            value={formatCurrency(paymentSummary.receivedCents)}
            hint={`${countLabel(paymentSummary.receivedCount, "sessão paga", "sessões pagas")} · ${formatCurrency(paymentSummary.overdueCents)} em atraso`}
            icon={CircleDollarSign}
            isHighlighted
          />
          <MonthResultCard
            incomeCents={paymentSummary.receivedCents}
            outcomeCents={expenseSummary.paidCents}
          />
          <StatCard
            label="A pagar atrasado"
            value={formatCurrency(expenseSummary.overdueCents)}
            hint={countLabel(expenseGroups.overdue.length, "conta", "contas")}
            icon={TriangleAlert}
          />
          <StatCard
            label="A pagar no mês"
            value={formatCurrency(expenseSummary.upcomingCents)}
            hint={`${countLabel(expenseGroups.upcoming.length, "conta", "contas")} · fixas ${formatCurrency(expenseSummary.recurringCents)}`}
            icon={CalendarClock}
          />
        </div>

        <Section title="Contas do mês">
          <ExpensesBoard
            groups={expenseGroups}
            todayKey={toDateKey(new Date())}
          />
        </Section>

        <Section title="Sessões do mês">
          <PaymentsView payments={payments} pixKey={settings.pixKey} />
        </Section>

        <Section title="Receita mensal" description="Recebido e a receber">
          <div className="rounded-xl border p-4">
            <RevenueChart data={monthlyRevenue} />
          </div>
        </Section>
      </PageContent>
    </>
  );
}

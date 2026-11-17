import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type Cents, fromCents } from "@/lib/money";

const LOCALE = "pt-BR";

export const APP_TIME_ZONE = "America/Sao_Paulo";

export const CURRENCY_SYMBOL = "$";

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(cents: Cents): string {
  const amount = fromCents(cents);
  const sign = amount < 0 ? "-" : "";
  return `${sign}${CURRENCY_SYMBOL} ${currencyFormatter.format(Math.abs(amount))}`;
}

export function toAppTimeZone(date: Date | string): TZDate {
  return new TZDate(new Date(date), APP_TIME_ZONE);
}

export function formatDate(date: Date | string): string {
  return format(toAppTimeZone(date), "dd/MM/yyyy", { locale: ptBR });
}

export function formatTime(date: Date | string): string {
  return format(toAppTimeZone(date), "HH:mm", { locale: ptBR });
}

export function formatDateTime(date: Date | string): string {
  return format(toAppTimeZone(date), "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  });
}

export function formatShortDate(date: Date | string): string {
  return format(toAppTimeZone(date), "EEEEEE, d MMM", { locale: ptBR });
}

export function formatLongDate(date: Date | string): string {
  return format(toAppTimeZone(date), "EEEE, d 'de' MMMM", { locale: ptBR });
}

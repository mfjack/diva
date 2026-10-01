import type { Brand } from "@/lib/brand";

export type Cents = Brand<number, "Cents">;

const CENTS_PER_UNIT = 100;

export function toCents(amount: number): Cents {
  return Math.round(amount * CENTS_PER_UNIT) as Cents;
}

export function fromCents(cents: Cents): number {
  return cents / CENTS_PER_UNIT;
}

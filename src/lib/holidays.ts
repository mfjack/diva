import { addDays, format } from "date-fns";

export type Holiday = {
  name: string;
  isOptional: boolean;
};

type HolidaySeed = Holiday & { date: Date };

const DATE_KEY_FORMAT = "yyyy-MM-dd";

const FIXED_HOLIDAYS = [
  { month: 1, day: 1, name: "Confraternização Universal" },
  { month: 4, day: 21, name: "Tiradentes" },
  { month: 5, day: 1, name: "Dia do Trabalho" },
  { month: 9, day: 7, name: "Independência do Brasil" },
  { month: 10, day: 12, name: "Nossa Senhora Aparecida" },
  { month: 11, day: 2, name: "Finados" },
  { month: 11, day: 15, name: "Proclamação da República" },
  { month: 11, day: 20, name: "Consciência Negra" },
  { month: 12, day: 25, name: "Natal" },
] as const;

const EASTER_BASED_HOLIDAYS = [
  { offsetDays: -48, name: "Carnaval", isOptional: true },
  { offsetDays: -47, name: "Carnaval", isOptional: true },
  { offsetDays: -2, name: "Sexta-feira Santa", isOptional: false },
  { offsetDays: 60, name: "Corpus Christi", isOptional: true },
] as const;

export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function listHolidaySeeds(year: number): HolidaySeed[] {
  const easterSunday = getEasterSunday(year);
  return [
    ...FIXED_HOLIDAYS.map(({ month, day, name }) => ({
      date: new Date(year, month - 1, day),
      name,
      isOptional: false,
    })),
    ...EASTER_BASED_HOLIDAYS.map(({ offsetDays, name, isOptional }) => ({
      date: addDays(easterSunday, offsetDays),
      name,
      isOptional,
    })),
  ];
}

const holidaysByYear = new Map<number, Map<string, Holiday>>();

function getHolidaysOfYear(year: number): Map<string, Holiday> {
  const cachedHolidays = holidaysByYear.get(year);
  if (cachedHolidays) return cachedHolidays;

  const holidays = new Map(
    listHolidaySeeds(year).map(({ date, name, isOptional }) => [
      format(date, DATE_KEY_FORMAT),
      { name, isOptional },
    ]),
  );
  holidaysByYear.set(year, holidays);
  return holidays;
}

export function getHoliday(dateKey: string): Holiday | null {
  const year = Number(dateKey.slice(0, 4));
  return getHolidaysOfYear(year).get(dateKey) ?? null;
}

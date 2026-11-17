export const CPF_PATTERN = "###.###.###-##";
const LANDLINE_PHONE_PATTERN = "(##) ####-####";
const MOBILE_PHONE_PATTERN = "(##) #####-####";

const LANDLINE_PHONE_LENGTH = 10;
const ELEVEN_DIGITS_PATTERN = /^\d{11}$/;
const REPEATED_ELEVEN_DIGITS_PATTERN = /^(\d)\1{10}$/;
const PHONE_DIGITS_PATTERN = /^\d{10,11}$/;

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function applyDigitPattern(digits: string, pattern: string): string {
  let formatted = "";
  let digitIndex = 0;

  for (const character of pattern) {
    if (digitIndex >= digits.length) break;
    if (character === "#") {
      formatted += digits[digitIndex];
      digitIndex++;
    } else {
      formatted += character;
    }
  }

  return formatted;
}

export function getPhonePattern(digits: string): string {
  return digits.length > LANDLINE_PHONE_LENGTH
    ? MOBILE_PHONE_PATTERN
    : LANDLINE_PHONE_PATTERN;
}

export function formatPhone(digits: string): string {
  return applyDigitPattern(digits, getPhonePattern(digits));
}

export function isValidPhone(digits: string): boolean {
  return PHONE_DIGITS_PATTERN.test(digits);
}

export function formatCpf(digits: string): string {
  return applyDigitPattern(digits, CPF_PATTERN);
}

function getCpfCheckDigit(digits: string, length: number) {
  let sum = 0;
  for (let index = 0; index < length; index++) {
    sum += Number(digits[index]) * (length + 1 - index);
  }
  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

export function isValidCpf(digits: string): boolean {
  if (
    !ELEVEN_DIGITS_PATTERN.test(digits) ||
    REPEATED_ELEVEN_DIGITS_PATTERN.test(digits)
  ) {
    return false;
  }
  return (
    getCpfCheckDigit(digits, 9) === Number(digits[9]) &&
    getCpfCheckDigit(digits, 10) === Number(digits[10])
  );
}

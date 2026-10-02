const BRAZIL_COUNTRY_CODE = "55";

export function getWhatsAppUrl(phone: string, message?: string): string {
  const url = `https://wa.me/${BRAZIL_COUNTRY_CODE}${phone}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

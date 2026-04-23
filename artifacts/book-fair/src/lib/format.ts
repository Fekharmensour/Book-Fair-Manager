export function formatCurrency(amount: number, locale: "en" | "ar" = "en"): string {
  const lang = locale === "ar" ? "ar-DZ" : "en-US";
  const n = new Intl.NumberFormat(lang, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return locale === "ar" ? `${n} د.ج` : `${n} DZD`;
}

export function formatDate(dateString: string, locale: "en" | "ar" = "en"): string {
  const lang = locale === "ar" ? "ar-DZ" : "en-US";
  return new Intl.DateTimeFormat(lang, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

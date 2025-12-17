import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrencySymbol(currencyCode: string): string {
  const currencyToSymbol: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
    CAD: "C$",
    AUD: "A$",
    CHF: "CHF",
    KRW: "₩",
    BRL: "R$",
    RUB: "₽",
    TRY: "₺",
    ILS: "₪",
    PLN: "zł",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    CZK: "Kč",
    HUF: "Ft",
    MXN: "$",
    ARS: "$",
    CLP: "$",
    COP: "$",
    AED: "د.إ",
    SAR: "﷼",
    QAR: "ر.ق",
    KWD: "د.ك",
    BHD: ".د.ب",
    OMR: "﷼",
    JOD: "د.ا",
    EGP: "£",
    MAD: "د.م.",
    NGN: "₦",
  };

  return currencyToSymbol[currencyCode] || "$";
}

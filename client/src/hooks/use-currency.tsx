import { createContext, useContext, useEffect, useState } from "react";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "CHF" | "CAD" | "AUD" | "MXN" | "ARS" | "COP" | "CLP" | "PEN" | "BRL" | "NZD";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const allCurrencies: CurrencyInfo[] = [
  { code: "ARS", symbol: "AR$", name: "Argentine Peso" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CLP", symbol: "CL$", name: "Chilean Peso" },
  { code: "COP", symbol: "CO$", name: "Colombian Peso" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "PEN", symbol: "S/.", name: "Peruvian Sol" },
  { code: "USD", symbol: "$", name: "US Dollar" },
];

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatMoney: (cents: number) => string;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem("app-currency");
    return (saved as CurrencyCode) || "USD";
  });

  useEffect(() => {
    localStorage.setItem("app-currency", currency);
  }, [currency]);

  const formatMoney = (cents: number): string => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
    }).format(cents / 100);
  };

  const currencySymbol = allCurrencies.find(c => c.code === currency)?.symbol || "$";

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatMoney, currencySymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}

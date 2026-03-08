import { useLanguage, type Language } from "@/hooks/use-language";
import { useCurrency, allCurrencies, type CurrencyCode } from "@/hooks/use-currency";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Globe, Moon, Sun, Monitor, Coins } from "lucide-react";

const languageOptions: { value: Language; label: string }[] = [
  { value: "de", label: "Deutsch (German)" },
  { value: "el", label: "Ελληνικά (Greek)" },
  { value: "en", label: "English" },
  { value: "es", label: "Español (Spanish)" },
  { value: "fr", label: "Français (French)" },
  { value: "it", label: "Italiano (Italian)" },
];

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground" data-testid="text-settings-title">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <CardTitle>{t("settings.language")}</CardTitle>
            </div>
            <CardDescription>{t("settings.languageDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="language-select">{t("settings.language")}</Label>
              <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
                <SelectTrigger id="language-select" className="w-full max-w-xs" data-testid="select-language">
                  <SelectValue placeholder={t("settings.selectLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} data-testid={`option-language-${opt.value}`}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <CardTitle>{t("settings.currency")}</CardTitle>
            </div>
            <CardDescription>{t("settings.currencyDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currency-select">{t("settings.currency")}</Label>
              <Select value={currency} onValueChange={(val) => setCurrency(val as CurrencyCode)}>
                <SelectTrigger id="currency-select" className="w-full max-w-xs" data-testid="select-currency">
                  <SelectValue placeholder={t("settings.selectCurrency")} />
                </SelectTrigger>
                <SelectContent>
                  {allCurrencies.map((cur) => (
                    <SelectItem key={cur.code} value={cur.code} data-testid={`option-currency-${cur.code}`}>
                      {cur.symbol} — {cur.name} ({cur.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-primary dark:hidden" />
              <Moon className="w-5 h-5 text-primary hidden dark:block" />
              <CardTitle>{t("settings.theme")}</CardTitle>
            </div>
            <CardDescription>{t("settings.themeDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="theme-select">{t("settings.theme")}</Label>
              <Select value={theme} onValueChange={(val) => setTheme(val)}>
                <SelectTrigger id="theme-select" className="w-full max-w-xs" data-testid="select-theme">
                  <SelectValue placeholder={t("settings.selectTheme")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      <span>{t("settings.light")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      <span>{t("settings.dark")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      <span>{t("settings.system")}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

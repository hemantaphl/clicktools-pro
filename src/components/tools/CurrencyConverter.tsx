import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDownUp,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Import flag-icons CSS
import "flag-icons/css/flag-icons.min.css";

// ── Currency metadata ────────────────────────────────────────────

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  country: string;
}

const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar", symbol: "$", country: "us" },
  { code: "EUR", name: "Euro", symbol: "€", country: "eu" },
  { code: "GBP", name: "British Pound", symbol: "£", country: "gb" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", country: "jp" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", country: "au" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", country: "ca" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", country: "ch" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", country: "cn" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", country: "in" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "रू", country: "np" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", country: "kr" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", country: "sg" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", country: "hk" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", country: "se" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", country: "no" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", country: "dk" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", country: "nz" },
  { code: "ZAR", name: "South African Rand", symbol: "R", country: "za" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", country: "br" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", country: "mx" },
  { code: "THB", name: "Thai Baht", symbol: "฿", country: "th" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", country: "my" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", country: "id" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", country: "ph" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$", country: "tw" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", country: "pk" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", country: "bd" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", country: "lk" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", country: "ae" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", country: "sa" },
  { code: "QAR", name: "Qatari Riyal", symbol: "﷼", country: "qa" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", country: "kw" },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BD", country: "bh" },
  { code: "OMR", name: "Omani Rial", symbol: "﷼", country: "om" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", country: "tr" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", country: "ru" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", country: "pl" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", country: "cz" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", country: "hu" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪", country: "il" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£", country: "eg" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", country: "ng" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", country: "ke" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", country: "gh" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", country: "vn" },
  { code: "MMK", name: "Myanmar Kyat", symbol: "K", country: "mm" },
  { code: "CLP", name: "Chilean Peso", symbol: "$", country: "cl" },
  { code: "COP", name: "Colombian Peso", symbol: "$", country: "co" },
  { code: "ARS", name: "Argentine Peso", symbol: "$", country: "ar" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/.", country: "pe" },
];

const WATCHLIST = ["USD", "EUR", "GBP", "INR", "NPR", "JPY", "AED", "CAD", "AUD"];

const getCurrency = (code: string) =>
  CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

const Flag = ({ country, className }: { country: string; className?: string }) => (
  <span className={cn(`fi fi-${country.toLowerCase()} rounded-sm`, className)} />
);

// ── API keys & fetch logic ───────────────────────────────────────

const API_PRIMARY = "https://v6.exchangerate-api.com/v6/a73fa30241b22e67384caec2/latest/";
const API_FALLBACK = "https://api.exchangerateapi.net/v1/latest?base=";
const FALLBACK_KEY = "77f409fd-8a59-4478-b75e-7ee05ed5b1d8";

const CACHE_KEY = "currency_rates_cache";
const CACHE_TTL = 30 * 60 * 1000;

interface RatesCache {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
  source: string;
}

function loadCache(base: string): RatesCache | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${base}`);
    if (!raw) return null;
    const cache: RatesCache = JSON.parse(raw);
    if (Date.now() - cache.timestamp < CACHE_TTL) return cache;
  } catch {}
  return null;
}

function saveCache(data: RatesCache) {
  try {
    localStorage.setItem(`${CACHE_KEY}_${data.base}`, JSON.stringify(data));
  } catch {}
}

async function fetchRates(base: string): Promise<RatesCache> {
  const cached = loadCache(base);
  if (cached) return cached;

  try {
    const res = await fetch(`${API_PRIMARY}${base}`);
    if (res.ok) {
      const data = await res.json();
      if (data.result === "success") {
        const cache: RatesCache = {
          base,
          rates: data.conversion_rates,
          timestamp: Date.now(),
          source: "exchangerate-api.com",
        };
        saveCache(cache);
        return cache;
      }
    }
  } catch {}

  try {
    const res = await fetch(`${API_FALLBACK}${base}`, {
      headers: { apikey: FALLBACK_KEY },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.rates) {
        const cache: RatesCache = {
          base,
          rates: data.rates,
          timestamp: Date.now(),
          source: "exchangerateapi.net",
        };
        saveCache(cache);
        return cache;
      }
    }
  } catch {}

  throw new Error("Both API sources are unavailable. Please try again later.");
}

function formatAmount(num: number, code: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: code === "JPY" || code === "KRW" ? 0 : 4,
    }).format(num);
  } catch {
    return num.toFixed(2);
  }
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ── Component ────────────────────────────────────────────────────

export function CurrencyConverter() {
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("NPR");
  const [amount, setAmount] = useState("1");
  const [ratesData, setRatesData] = useState<RatesCache | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  const loadRates = useCallback(
    async (base: string) => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchRates(base);
        setRatesData(data);
      } catch (e: any) {
        setError(e.message || "Failed to fetch rates");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadRates(fromCode);
  }, [fromCode, loadRates]);

  const result = useMemo(() => {
    if (!ratesData || !ratesData.rates[toCode]) return null;
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0) return null;
    return num * ratesData.rates[toCode];
  }, [amount, toCode, ratesData]);

  const rate = ratesData?.rates[toCode] ?? null;
  const inverseRate = rate ? 1 / rate : null;

  const swap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
    if (result !== null) setAmount(formatAmount(result, toCode).replace(/,/g, ""));
  };

  const copyResult = () => {
    if (result === null) return;
    navigator.clipboard.writeText(formatAmount(result, toCode));
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  const filterCurrencies = (q: string) => {
    if (!q) return CURRENCIES;
    const lower = q.toLowerCase();
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(lower) ||
        c.name.toLowerCase().includes(lower)
    );
  };

  const fromCurrency = getCurrency(fromCode);
  const toCurrency = getCurrency(toCode);

  const quickPairs = [
    ["USD", "NPR"],
    ["USD", "INR"],
    ["EUR", "USD"],
    ["GBP", "USD"],
    ["USD", "JPY"],
  ];

  return (
    <div className="space-y-4">
      {/* Quick pairs */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Quick Convert</Label>
        <div className="flex flex-wrap gap-2">
          {quickPairs.map(([f, t]) => {
            const fCurr = getCurrency(f);
            const tCurr = getCurrency(t);
            return (
              <Button
                key={`${f}-${t}`}
                size="sm"
                variant={fromCode === f && toCode === t ? "default" : "outline"}
                className="rounded-full text-xs h-8 px-3"
                onClick={() => {
                  setFromCode(f);
                  setToCode(t);
                  setAmount("1");
                }}
              >
                <Flag country={fCurr.country} className="mr-1.5" /> {f} 
                <span className="mx-1 opacity-50">→</span> 
                <Flag country={tCurr.country} className="mr-1.5" /> {t}
              </Button>
            );
          })}
        </div>
      </div>

      <Card className="border-border/50 bg-surface">
        <CardContent className="p-4 space-y-4">
          {/* From currency */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Select value={fromCode} onValueChange={setFromCode}>
              <SelectTrigger className="rounded-xl bg-background border-border/50 h-11">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <Flag country={fromCurrency.country} />
                    <span className="font-medium">{fromCode}</span>
                    <span className="text-muted-foreground text-xs hidden sm:inline">
                      {fromCurrency.name}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50 [&>div]:p-0" style={{ maxHeight: '300px' }}>
                <div className="sticky top-0 px-2 pt-2 pb-2 bg-popover z-20 border-b border-border/30" onPointerDown={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      className="w-full rounded-lg border border-border/50 bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder="Search currency..."
                      value={searchFrom}
                      onChange={(e) => setSearchFrom(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                {filterCurrencies(searchFrom).map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <Flag country={c.country} />
                      <span className="font-medium">{c.code}</span>
                      <span className="text-muted-foreground text-xs">
                        {c.name}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                {fromCurrency.symbol}
              </span>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="text-lg font-semibold pl-12"
              />
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 border-primary/30 hover:bg-primary/10"
              onClick={swap}
            >
              <ArrowDownUp className="h-4 w-4 text-primary" />
            </Button>
          </div>

          {/* To currency */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Select value={toCode} onValueChange={setToCode}>
              <SelectTrigger className="rounded-xl bg-background border-border/50 h-11">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <Flag country={toCurrency.country} />
                    <span className="font-medium">{toCode}</span>
                    <span className="text-muted-foreground text-xs hidden sm:inline">
                      {toCurrency.name}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50 [&>div]:p-0" style={{ maxHeight: '300px' }}>
                <div className="sticky top-0 px-2 pt-2 pb-2 bg-popover z-20 border-b border-border/30" onPointerDown={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      className="w-full rounded-lg border border-border/50 bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30"
                      placeholder="Search currency..."
                      value={searchTo}
                      onChange={(e) => setSearchTo(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                {filterCurrencies(searchTo).map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <Flag country={c.country} />
                      <span className="font-medium">{c.code}</span>
                      <span className="text-muted-foreground text-xs">
                        {c.name}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Result Area */}
            {loading ? (
              <div className="flex items-center justify-center rounded-xl bg-primary/5 border border-primary/20 px-4 py-4">
                <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Fetching rates...
                </span>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 text-xs"
                  onClick={() => loadRates(fromCode)}
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Retry
                </Button>
              </div>
            ) : (
              <div
                className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={copyResult}
              >
                <div>
                  <span className="text-lg font-bold text-foreground">
                    {result !== null
                      ? `${toCurrency.symbol} ${formatAmount(result, toCode)}`
                      : "—"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rate Details */}
      {rate !== null && !loading && !error && (
        <Card className="border-border/50 bg-surface">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Exchange Rate
              </span>
              {ratesData && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {timeAgo(ratesData.timestamp)}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  1 {fromCode}
                </span>
                <span className="font-semibold">
                  {formatAmount(rate, toCode)} {toCode}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                  1 {toCode}
                </span>
                <span className="font-semibold">
                  {inverseRate !== null
                    ? formatAmount(inverseRate, fromCode)
                    : "—"}{" "}
                  {fromCode}
                </span>
              </div>
            </div>

            {ratesData?.source && (
              <p className="text-[10px] text-muted-foreground text-right">
                Source: {ratesData.source}
              </p>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                try {
                  localStorage.removeItem(`${CACHE_KEY}_${fromCode}`);
                } catch {}
                loadRates(fromCode);
              }}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Refresh Rates
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── NEW CONTENT ADDED BELOW CURRENT CONTENT ────────────────── */}

      {/* Live Currency Rates List */}
      <Card className="border-border/50 bg-surface">
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-muted/20">
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Globe className="h-4 w-4 text-primary" /> Live Currency Rates
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Base: 1 {fromCode}
            </span>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40 max-h-[350px] overflow-y-auto">
            {WATCHLIST.filter(code => code !== fromCode).map(code => {
              const curr = getCurrency(code);
              const mRate = ratesData?.rates[code] || 0;
              return (
                <div key={code} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Flag country={curr.country} className="h-4 w-6 rounded-sm shadow-sm" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">{code}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{curr.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-primary">
                        {mRate ? formatAmount(mRate, code) : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Last Updated Date + Time Footer */}
      <div className="flex flex-col items-center justify-center space-y-1.5 py-4 border-t border-border/20">
          <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Last Updated Date + Time</span>
          </div>
          <p className="text-base font-bold text-foreground">
              {ratesData ? new Date(ratesData.timestamp).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'medium'
              }) : "Updating..."}
          </p>
          <p className="text-[10px] text-muted-foreground italic">Market data is updated every 30 minutes</p>
      </div>
    </div>
  );
}
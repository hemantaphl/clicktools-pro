import { useState, useMemo, useCallback } from "react";
import { ArrowRightLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getBsYears,
  getBsDaysInMonth,
  getAdDaysInMonth,
  bsToAd,
  adToBs,
  BS_MONTHS,
  AD_MONTHS,
  getAdYearRange,
} from "@/lib/bs-date-utils";

type ConvertMode = "AD_TO_BS" | "BS_TO_AD";

export function DateConverter() {
  const [mode, setMode] = useState<ConvertMode>("AD_TO_BS");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const isAd = mode === "AD_TO_BS";

  const years = useMemo(() => {
    if (!isAd) return getBsYears();
    const range = getAdYearRange();
    const arr: number[] = [];
    for (let y = range.max; y >= range.min; y--) arr.push(y);
    return arr;
  }, [isAd]);

  const months = isAd ? AD_MONTHS : BS_MONTHS;

  const daysInMonth = useMemo(() => {
    if (!selectedYear || !selectedMonth) return 31;
    const y = parseInt(selectedYear);
    const m = parseInt(selectedMonth);
    return isAd ? getAdDaysInMonth(y, m) : getBsDaysInMonth(y, m);
  }, [selectedYear, selectedMonth, isAd]);

  const effectiveDay = useMemo(() => {
    if (!selectedDay) return "";
    return parseInt(selectedDay) > daysInMonth ? "" : selectedDay;
  }, [selectedDay, daysInMonth]);

  const result = useMemo(() => {
    if (!selectedYear || !selectedMonth || !effectiveDay) return null;
    const y = parseInt(selectedYear);
    const m = parseInt(selectedMonth);
    const d = parseInt(effectiveDay);

    if (isAd) {
      // FIX: Added 12:00:00 to prevent timezone slippage
      const adDate = new Date(y, m - 1, d, 12, 0, 0);
      const bs = adToBs(adDate);
      if (!bs) return null;
      return {
        fromLabel: "AD Date",
        fromValue: adDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        toLabel: "BS Date",
        toValue: `${bs.year} ${BS_MONTHS[bs.month - 1]} ${bs.day}`,
        dayOfWeek: adDate.toLocaleDateString("en-US", { weekday: "long" }),
      };
    } else {
      const convertedAd = bsToAd(y, m, d);
      if (!convertedAd) return null;
      
      // FIX: Normalize the converted AD date to midday for consistent display
      const adDate = new Date(convertedAd.getFullYear(), convertedAd.getMonth(), convertedAd.getDate(), 12, 0, 0);
      
      const bsDisplay = `${y} ${BS_MONTHS[m - 1]} ${d}`;
      return {
        fromLabel: "BS Date",
        fromValue: bsDisplay,
        toLabel: "AD Date",
        toValue: adDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        dayOfWeek: adDate.toLocaleDateString("en-US", { weekday: "long" }),
      };
    }
  }, [selectedYear, selectedMonth, effectiveDay, isAd]);

  const handleModeSwitch = useCallback((m: ConvertMode) => {
    setMode(m);
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedDay("");
  }, []);

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="bg-card rounded-lg p-4">
        <div className="flex rounded-lg bg-muted p-1">
          {([
            { key: "AD_TO_BS" as const, label: "AD → BS" },
            { key: "BS_TO_AD" as const, label: "BS → AD" },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleModeSwitch(key)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Selectors */}
      <div className="bg-card rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          Enter {isAd ? "AD (English)" : "BS (Nepali)"} Date
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Year</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full bg-muted/50">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-popover">
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Month</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full bg-muted/50">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-popover">
                {months.map((name, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Day</label>
            <Select value={effectiveDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-full bg-muted/50">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-popover">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-card rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <ArrowRightLeft className="w-5 h-5" />
            <span className="text-sm font-semibold">Converted Result</span>
          </div>

          <div className="bg-primary/10 rounded-lg p-5 text-center space-y-2">
            <p className="text-xs text-muted-foreground">{result.fromLabel}</p>
            <p className="text-sm font-medium text-foreground">{result.fromValue}</p>
            <div className="flex items-center justify-center py-1">
              <ArrowRightLeft className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">{result.toLabel}</p>
            <p className="text-xl font-bold text-primary">{result.toValue}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Day of the week: <span className="font-medium text-foreground">{result.dayOfWeek}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}